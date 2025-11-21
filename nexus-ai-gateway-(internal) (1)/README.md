# Nexus AI Gateway (Internal)

A local-first control plane for routing and monitoring internal LLM inference clusters. This gateway is designed to work with **Ollama** and **vLLM** running within your private network.

## Features

- **Auto-Discovery**: Automatically scans standard ports (11434, 8000) to find active models.
- **Unified Playground**: Test prompts against `gemma3`, `llama3`, or `mistral` from a single interface.
- **Metrics**: Visualizes model latency and token throughput.
- **Offline**: Zero external API calls; data never leaves your network.

## Prerequisites

- **Node.js** (v18 or higher)
- **Ollama** (Running locally)
- **vLLM** (Optional)

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AI Providers (Crucial)
By default, browsers block frontend applications from talking to local API servers. You must enable CORS on your inference engines.

**For Ollama:**
*   **Mac/Linux**:
    ```bash
    OLLAMA_ORIGINS="*" ollama serve
    ```
*   **Windows (PowerShell)**:
    ```powershell
    $env:OLLAMA_ORIGINS="*"; ollama serve
    ```

**For vLLM:**
Add the CORS flag when launching:
```bash
python -m vllm.entrypoints.openai.api_server --model mistralai/Mistral-7B-Instruct-v0.3 --cors-allow-origins "*"
```

### 3. Run the Gateway
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Troubleshooting

**"No models detected" in Routes?**
1. Ensure Ollama is running (`curl http://localhost:11434/api/tags` should return JSON).
2. Check your browser console (F12). If you see "CORS error", verify step #2 above.
3. Ensure you aren't using an ad-blocker that blocks localhost requests.
