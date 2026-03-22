"""
DW_apb_i2c Chapter 6 Register Extractor
========================================
Uses pdfplumber for deterministic table + text extraction.
No LLM, no images. Every field sourced directly from PDF structure.

Strategy
--------
1. Parse TOC (pages 3-7) to build the authoritative register index:
       [(section, register_name, start_page), ...]
   Each register owns pages [start_page, next_start_page - 1].

2. For each register's page range:
   a. Extract the memory-map header row (offset, width, access type, reset)
      from the first text block above the field table.
   b. Extract the bit-field table rows using pdfplumber table extraction.
   c. Accumulate description text that follows the table (may span pages).

3. Validate every extracted register against the master memory map
   (section 6.1, pages 153-160) — offset cross-check.

4. Emit a single JSON file, registers ordered by their TOC position.

Output schema per register
--------------------------
{
  "name": "IC_CON",
  "offset": "0x0",
  "width": 32,
  "access": "RW",
  "reset": "0x7f",
  "source_pages": [161, 167],
  "validation": {
    "status": "ok",           // "ok" | "offset_mismatch" | "table_missing" | "partial"
    "expected_offset": "0x0", // from master map; null if not found there
    "notes": []
  },
  "fields": [
    {
      "bits": "2:0",
      "bit_high": 2,
      "bit_low": 0,
      "name": "SPEED",
      "access": "RW",
      "reset": "0x2",
      "description": "These bits control at which speed the DW_apb_i2c operates..."
    },
    ...
  ]
}

Usage
-----
  pip install pdfplumber
  python extract_registers.py <path_to_pdf> [--out registers.json] [--debug]

The script is self-contained. No external config required for this specific
databook. Pass --config <file> to override page_offset or chapter_bounds
for a different edition.
"""

import re
import json
import argparse
import logging
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

try:
    import pdfplumber
except ImportError:
    sys.exit("pdfplumber not installed. Run: pip install pdfplumber")


# ---------------------------------------------------------------------------
# Configuration — tuned for DW_apb_i2c databook v2.00a (June 2015)
# Override via --config JSON if page numbers shift in other editions.
# ---------------------------------------------------------------------------
DEFAULT_CONFIG = {
    # PDF uses a logical page offset: PDF page index 0 = document page 1.
    # Chapter 6 starts at document page 153, so PDF index = 152.
    "page_offset": 0,          # pdf_index = doc_page - 1 + page_offset
    "toc_pages": [2, 3, 4, 5, 6, 7],   # 0-indexed PDF pages that contain TOC
    "chapter6_start_doc_page": 153,     # document page where Chapter 6 begins
    "chapter6_end_doc_page": 350,       # safe upper bound; actual end detected
    "memory_map_doc_page": 153,         # section 6.1 memory map page
    "memory_map_end_doc_page": 160,     # last page of section 6.1
    # Column header patterns used to identify the bit-field table
    "field_table_headers": ["bits", "bit", "name", "access", "reset", "description"],
    # Minimum columns a valid field table row must have
    "field_table_min_cols": 4,
}


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------
@dataclass
class FieldEntry:
    bits: str
    bit_high: int
    bit_low: int
    name: str
    access: str
    reset: str
    description: str


@dataclass
class ValidationResult:
    status: str = "ok"            # ok | offset_mismatch | table_missing | partial
    expected_offset: Optional[str] = None
    notes: list = field(default_factory=list)


@dataclass
class RegisterEntry:
    name: str
    offset: str
    width: int
    access: str
    reset: str
    source_pages: list
    validation: ValidationResult
    fields: list


# ---------------------------------------------------------------------------
# TOC parsing
# ---------------------------------------------------------------------------
# Matches lines like:  "6.3.1 IC_CON . . . . 161"
# or                   "6.3.12 IC_INTR_STAT . . 182"
TOC_REGISTER_RE = re.compile(
    r"6\.3\.(\d+)\s+(IC_[A-Z0-9_]+)\s+[.\s]+(\d+)"
)

def parse_toc(pdf, config: dict) -> list[tuple[int, str, int]]:
    """
    Returns list of (section_number, register_name, doc_page_number)
    sorted by section number, sourced from TOC pages only.
    """
    entries = []
    seen = set()

    for pidx in config["toc_pages"]:
        if pidx >= len(pdf.pages):
            continue
        text = pdf.pages[pidx].extract_text() or ""
        for m in TOC_REGISTER_RE.finditer(text):
            sec = int(m.group(1))
            name = m.group(2).strip()
            page = int(m.group(3))
            key = (sec, name)
            if key not in seen:
                seen.add(key)
                entries.append((sec, name, page))

    entries.sort(key=lambda x: x[0])
    logging.info(f"TOC: found {len(entries)} registers")
    return entries


# ---------------------------------------------------------------------------
# Master memory map parsing (section 6.1)
# Extracts {register_name: offset_hex} for cross-validation.
# ---------------------------------------------------------------------------
# Matches lines like: "IC_CON  0x0  ..."  or  "0x00  IC_CON  ..."
MEMMAP_ROW_RE = re.compile(
    r"(IC_[A-Z0-9_]+)\s+(0x[0-9a-fA-F]+)|(0x[0-9a-fA-F]+)\s+(IC_[A-Z0-9_]+)"
)

def parse_memory_map(pdf, config: dict) -> dict[str, str]:
    """
    Returns {register_name: "0xNN"} from section 6.1 memory map tables.
    """
    master = {}
    start = config["memory_map_doc_page"] - 1  # convert to 0-index
    end = min(config["memory_map_end_doc_page"], len(pdf.pages))

    for pidx in range(start, end):
        page = pdf.pages[pidx]
        # Try structured table first
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                if not row:
                    continue
                cells = [c.strip() if c else "" for c in row]
                # Look for a cell matching IC_XXX and one matching 0xNN
                names = [c for c in cells if re.match(r"IC_[A-Z0-9_]+$", c)]
                offsets = [c for c in cells if re.match(r"0x[0-9a-fA-F]+$", c)]
                if names and offsets:
                    master[names[0]] = offsets[0].lower()

        # Fallback: raw text scan
        text = page.extract_text() or ""
        for m in MEMMAP_ROW_RE.finditer(text):
            if m.group(1):
                name, offset = m.group(1), m.group(2).lower()
            else:
                name, offset = m.group(4), m.group(3).lower()
            if name not in master:
                master[name] = offset

    logging.info(f"Master map: {len(master)} entries")
    return master


# ---------------------------------------------------------------------------
# Register header parsing
# Extracts offset, width, access, reset from text above the field table.
# Example text block:
#   "IC_CON (offset: 0x0, 32 bits, RW, reset: 0x7f)"
#   or split across lines in various formats.
# ---------------------------------------------------------------------------
HEADER_OFFSET_RE = re.compile(r"offset[:\s]*(0x[0-9a-fA-F]+)", re.I)
HEADER_WIDTH_RE  = re.compile(r"(\d+)\s*bits?", re.I)
HEADER_ACCESS_RE = re.compile(r"\b(RW|RO|WO|W1C|RC)\b")
HEADER_RESET_RE  = re.compile(r"reset[:\s]*(0x[0-9a-fA-F]+|\d+)", re.I)


def parse_register_header(text: str) -> dict:
    offset = "unknown"
    width = 32
    access = "unknown"
    reset = "unknown"

    m = HEADER_OFFSET_RE.search(text)
    if m:
        offset = m.group(1).lower()

    m = HEADER_WIDTH_RE.search(text)
    if m:
        width = int(m.group(1))

    m = HEADER_ACCESS_RE.search(text)
    if m:
        access = m.group(1)

    m = HEADER_RESET_RE.search(text)
    if m:
        raw = m.group(1)
        reset = hex(int(raw, 0)) if raw.startswith("0x") else hex(int(raw))

    return {"offset": offset, "width": width, "access": access, "reset": reset}


# ---------------------------------------------------------------------------
# Bit range parsing
# Handles: "31:3", "2", "[31:3]", "31 to 3"
# ---------------------------------------------------------------------------
BITS_RANGE_RE = re.compile(r"(\d+)[:\-–to\s]+(\d+)")
BITS_SINGLE_RE = re.compile(r"^\[?(\d+)\]?$")

def parse_bits(bits_str: str) -> tuple[int, int]:
    """Returns (high, low). For single bit returns (n, n)."""
    s = bits_str.strip().strip("[]")
    m = BITS_RANGE_RE.search(s)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return (max(a, b), min(a, b))
    m = BITS_SINGLE_RE.match(s)
    if m:
        n = int(m.group(1))
        return (n, n)
    return (-1, -1)  # sentinel for unparseable


# ---------------------------------------------------------------------------
# Field table extraction
# ---------------------------------------------------------------------------
def is_header_row(row: list[str]) -> bool:
    """True if this row looks like the column header of a field table."""
    joined = " ".join(r.lower() for r in row if r)
    return (
        ("bit" in joined or "bits" in joined)
        and ("name" in joined or "field" in joined)
        and ("description" in joined or "desc" in joined)
    )

def is_reserved_field(name: str) -> bool:
    return name.lower() in ("reserved", "rsvd", "res", "-", "")

def clean_cell(c) -> str:
    if c is None:
        return ""
    return " ".join(str(c).split())  # collapse internal whitespace


def extract_field_table(page, config: dict) -> list[dict]:
    """
    Extract bit-field rows from a single page.
    Returns list of raw dicts with keys: bits, name, access, reset, description.
    Empty list if no field table found on this page.
    """
    tables = page.extract_tables({
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "join_tolerance": 3,
    })

    best_table = None
    best_score = 0

    for table in tables:
        if not table or len(table) < 2:
            continue
        score = 0
        header_found = False
        for row in table[:3]:  # header should be in first 3 rows
            if row and is_header_row([clean_cell(c) for c in row]):
                header_found = True
                score += 10
                break
        if not header_found:
            continue
        # Prefer tables with more rows (more fields = better candidate)
        score += len(table)
        # Must have at least min_cols columns
        max_cols = max(len(r) for r in table if r)
        if max_cols < config["field_table_min_cols"]:
            continue
        if score > best_score:
            best_score = score
            best_table = table

    if not best_table:
        return []

    # Detect column positions from header row
    header_row = None
    data_start = 0
    for i, row in enumerate(best_table[:4]):
        if row and is_header_row([clean_cell(c) for c in row]):
            header_row = [clean_cell(c).lower() for c in row]
            data_start = i + 1
            break

    if not header_row:
        return []

    # Map column names to indices (flexible column ordering)
    def find_col(keywords):
        for kw in keywords:
            for i, h in enumerate(header_row):
                if kw in h:
                    return i
        return -1

    col_bits  = find_col(["bits", "bit"])
    col_name  = find_col(["name", "field"])
    col_acc   = find_col(["access", "acc", "type"])
    col_reset = find_col(["reset", "default"])
    col_desc  = find_col(["description", "desc"])

    if col_bits == -1 or col_name == -1:
        return []

    fields = []
    for row in best_table[data_start:]:
        if not row:
            continue
        cells = [clean_cell(c) for c in row]
        if len(cells) <= max(col_bits, col_name):
            continue

        bits_str = cells[col_bits] if col_bits < len(cells) else ""
        name_str = cells[col_name] if col_name < len(cells) else ""
        acc_str  = cells[col_acc]  if col_acc  >= 0 and col_acc  < len(cells) else ""
        rst_str  = cells[col_reset] if col_reset >= 0 and col_reset < len(cells) else ""
        desc_str = cells[col_desc] if col_desc >= 0 and col_desc < len(cells) else ""

        # Skip rows that look like continuation of previous description
        if not bits_str and not name_str:
            # Append to last field's description
            if fields and desc_str:
                fields[-1]["description"] += " " + desc_str
            continue

        if not bits_str:
            continue

        high, low = parse_bits(bits_str)
        if high == -1:
            continue  # unparseable bits column

        fields.append({
            "bits": bits_str,
            "bit_high": high,
            "bit_low": low,
            "name": name_str,
            "access": acc_str,
            "reset": rst_str,
            "description": desc_str,
        })

    return fields


# ---------------------------------------------------------------------------
# Multi-page description accumulator
# Collects prose text that follows the field table (may continue onto next pages).
# Stops when it hits the next register's header pattern.
# ---------------------------------------------------------------------------
NEXT_REGISTER_RE = re.compile(r"^\d+\.\d+\.\d+\s+IC_[A-Z0-9_]", re.M)

def extract_description_text(pdf, page_indices: list[int], next_register_name: Optional[str]) -> str:
    """
    Walks pages collecting text after the field table.
    Stops at next register heading or end of page range.
    """
    paragraphs = []
    for pidx in page_indices:
        if pidx >= len(pdf.pages):
            break
        text = pdf.pages[pidx].extract_text() or ""
        # If next register exists, clip at its heading
        if next_register_name:
            pattern = re.compile(
                r"\d+\.\d+\.\d+\s+" + re.escape(next_register_name), re.M
            )
            m = pattern.search(text)
            if m:
                text = text[:m.start()]
        # Strip page header/footer noise (common in this doc: "Synopsys, Inc. SolvNet N")
        text = re.sub(r"Synopsys,\s*Inc\..*?DesignWare\.com", "", text, flags=re.S)
        text = re.sub(r"\d+\s+SolvNet\s+Synopsys", "", text)
        # Collect non-empty, non-table-looking lines
        for line in text.splitlines():
            line = line.strip()
            if line and not re.match(r"^[\d\s\|]+$", line):
                paragraphs.append(line)

    return " ".join(paragraphs)


# ---------------------------------------------------------------------------
# Main extraction loop
# ---------------------------------------------------------------------------
def extract_register(
    pdf,
    name: str,
    page_start: int,   # 0-indexed PDF page
    page_end: int,     # 0-indexed PDF page (inclusive)
    master_map: dict,
    config: dict,
    next_register_name: Optional[str] = None,
) -> RegisterEntry:
    """
    Extract one complete register spanning [page_start, page_end].
    """
    notes = []
    all_fields = []
    header_info = {"offset": "unknown", "width": 32, "access": "unknown", "reset": "unknown"}
    header_found = False

    page_indices = list(range(page_start, min(page_end + 1, len(pdf.pages))))

    for pidx in page_indices:
        page = pdf.pages[pidx]
        text = page.extract_text() or ""

        # Parse header from first page only (or until found)
        if not header_found:
            h = parse_register_header(text)
            if h["offset"] != "unknown":
                header_info = h
                header_found = True
            elif name in text:
                # Header exists but offset not in readable text —
                # try extracting from tables on this page
                tables = page.extract_tables()
                for t in tables:
                    for row in t or []:
                        row_text = " ".join(clean_cell(c) for c in row if c)
                        h2 = parse_register_header(row_text)
                        if h2["offset"] != "unknown":
                            header_info = h2
                            header_found = True
                            break
                    if header_found:
                        break

        # Extract field table rows from this page
        page_fields = extract_field_table(page, config)
        if page_fields:
            # Merge: avoid duplicate field names from multi-page tables
            existing_names = {f["name"] for f in all_fields}
            for f in page_fields:
                if f["name"] not in existing_names or is_reserved_field(f["name"]):
                    all_fields.append(f)
                    existing_names.add(f["name"])

    # Accumulate description text (appended to each field from extended text)
    full_text = extract_description_text(pdf, page_indices, next_register_name)

    # Post-process: fill in missing field descriptions from full_text
    for f in all_fields:
        if not f["description"] and f["name"] and not is_reserved_field(f["name"]):
            # Search for the field name in the full text and extract surrounding sentence
            pattern = re.compile(
                r"(?:^|\b)" + re.escape(f["name"]) + r"\b(.{0,300}?)(?:\.|$)",
                re.M | re.S
            )
            m = pattern.search(full_text)
            if m:
                f["description"] = (f["name"] + " " + m.group(1)).strip()

    # Validation against master map
    expected_offset = master_map.get(name)
    val_status = "ok"
    val_notes = []

    if not all_fields:
        val_status = "table_missing"
        val_notes.append(f"No field table extracted from pages {page_start+1}-{page_end+1}")
        logging.warning(f"  {name}: no field table found")

    if header_info["offset"] == "unknown":
        if val_status == "ok":
            val_status = "partial"
        val_notes.append("Register offset could not be parsed from page text")
        logging.warning(f"  {name}: offset not found in text")

    if expected_offset and header_info["offset"] != "unknown":
        # Normalise both to int for comparison
        try:
            got = int(header_info["offset"], 16)
            exp = int(expected_offset, 16)
            if got != exp:
                val_status = "offset_mismatch"
                val_notes.append(
                    f"Offset mismatch: extracted={header_info['offset']} "
                    f"master_map={expected_offset}"
                )
                logging.error(f"  {name}: OFFSET MISMATCH extracted={header_info['offset']} expected={expected_offset}")
        except ValueError:
            val_notes.append("Could not compare offsets numerically")

    return RegisterEntry(
        name=name,
        offset=header_info["offset"],
        width=header_info["width"],
        access=header_info["access"],
        reset=header_info["reset"],
        source_pages=[page_start + 1, page_end + 1],  # back to 1-indexed for readability
        validation=ValidationResult(
            status=val_status,
            expected_offset=expected_offset,
            notes=val_notes,
        ),
        fields=[
            FieldEntry(
                bits=f["bits"],
                bit_high=f["bit_high"],
                bit_low=f["bit_low"],
                name=f["name"],
                access=f["access"],
                reset=f["reset"],
                description=f["description"],
            )
            for f in all_fields
        ],
    )


# ---------------------------------------------------------------------------
# Serialisation helpers
# ---------------------------------------------------------------------------
def register_to_dict(reg: RegisterEntry) -> dict:
    return {
        "name": reg.name,
        "offset": reg.offset,
        "width": reg.width,
        "access": reg.access,
        "reset": reg.reset,
        "source_pages": reg.source_pages,
        "validation": {
            "status": reg.validation.status,
            "expected_offset": reg.validation.expected_offset,
            "notes": reg.validation.notes,
        },
        "fields": [
            {
                "bits": f.bits,
                "bit_high": f.bit_high,
                "bit_low": f.bit_low,
                "name": f.name,
                "access": f.access,
                "reset": f.reset,
                "description": f.description,
            }
            for f in reg.fields
        ],
    }


def emit_validation_report(registers: list[RegisterEntry]) -> dict:
    issues = []
    for reg in registers:
        if reg.validation.status != "ok":
            issues.append({
                "register": reg.name,
                "status": reg.validation.status,
                "notes": reg.validation.notes,
            })
    return {
        "total": len(registers),
        "ok": sum(1 for r in registers if r.validation.status == "ok"),
        "issues": issues,
    }


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Extract Chapter 6 registers from DW_apb_i2c databook PDF")
    parser.add_argument("pdf", help="Path to the PDF file")
    parser.add_argument("--out", default="registers.json", help="Output JSON path")
    parser.add_argument("--report", default="validation_report.json", help="Validation report path")
    parser.add_argument("--config", help="Optional JSON config override file")
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.debug else logging.INFO,
        format="%(levelname)s %(message)s",
    )

    config = dict(DEFAULT_CONFIG)
    if args.config:
        with open(args.config) as f:
            config.update(json.load(f))

    pdf_path = Path(args.pdf)
    if not pdf_path.exists():
        sys.exit(f"PDF not found: {pdf_path}")

    logging.info(f"Opening: {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        logging.info(f"Total PDF pages: {total_pages}")

        # --- Step 1: Parse TOC ---
        toc = parse_toc(pdf, config)
        if not toc:
            sys.exit("ERROR: No registers found in TOC. Check toc_pages config.")

        # --- Step 2: Parse master memory map ---
        master_map = parse_memory_map(pdf, config)

        # --- Step 3: Build page ranges from TOC ---
        # doc_page -> 0-indexed pdf page:  pidx = doc_page - 1
        ranges = []
        for i, (sec, name, doc_page) in enumerate(toc):
            start_pidx = doc_page - 1
            if i + 1 < len(toc):
                next_doc_page = toc[i + 1][2]
                next_name = toc[i + 1][1]
                # End page = page before next register starts
                end_pidx = next_doc_page - 2
            else:
                # Last register: extend to chapter end or PDF end
                end_pidx = min(config["chapter6_end_doc_page"] - 1, total_pages - 1)
                next_name = None
            # Safety: never go backwards
            end_pidx = max(end_pidx, start_pidx)
            ranges.append((name, start_pidx, end_pidx, next_name))

        logging.info(f"Processing {len(ranges)} registers...")

        # --- Step 4: Extract each register ---
        registers = []
        for name, start_pidx, end_pidx, next_name in ranges:
            logging.info(f"  Extracting {name} (doc pages {start_pidx+1}–{end_pidx+1})")
            reg = extract_register(
                pdf, name, start_pidx, end_pidx,
                master_map, config, next_name
            )
            registers.append(reg)

    # --- Step 5: Emit outputs ---
    output = {
        "metadata": {
            "source": str(pdf_path.name),
            "total_registers": len(registers),
            "extraction_tool": "extract_registers.py",
        },
        "registers": [register_to_dict(r) for r in registers],
    }

    out_path = Path(args.out)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    logging.info(f"Written: {out_path} ({out_path.stat().st_size // 1024} KB)")

    report = emit_validation_report(registers)
    report_path = Path(args.report)
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # Summary
    ok = report["ok"]
    total = report["total"]
    issues = len(report["issues"])
    logging.info(f"\nResult: {ok}/{total} registers clean, {issues} with issues")
    if issues:
        logging.warning("Issues detected — see validation_report.json")
        for issue in report["issues"]:
            logging.warning(f"  {issue['register']}: {issue['status']} — {'; '.join(issue['notes'])}")

    sys.exit(0 if issues == 0 else 1)


if __name__ == "__main__":
    main()
