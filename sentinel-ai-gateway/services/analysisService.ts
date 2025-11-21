import { LogEntry } from '../types';

// Configuration for Local LLM (Ollama)
// NOTE: Ensure your local Ollama instance is running with `OLLAMA_ORIGINS="*"` to allow browser requests.
// Linux/Mac: launch with `OLLAMA_ORIGINS="*" ollama serve`
// Windows: set OLLAMA_ORIGINS environment variable to "*"
const LOCAL_LLM_ENDPOINT = 'http://localhost:11434/api/generate';
const ANALYSIS_MODEL = 'llama3'; 

export const analyzeGatewayTraffic = async (logs: LogEntry[]): Promise<string> => {
  const recentLogs = logs.slice(0, 20); // Analyze last 20 logs to save context
  const prompt = `
    You are an AI Site Reliability Engineer (SRE) for a local AI Gateway.
    Analyze the following recent API traffic logs from the gateway.
    Identify patterns, potential anomalies, latency spikes, or optimizations.
    
    Logs:
    ${JSON.stringify(recentLogs, null, 2)}

    Provide a concise, bulleted list of insights and 1 recommendation for policy tuning.
  `;

  try {
    // Attempt to call local Ollama instance
    const controller = new AbortController();
    // Short timeout to fail fast if local model isn't running
    const timeoutId = setTimeout(() => controller.abort(), 3000); 

    const response = await fetch(LOCAL_LLM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ANALYSIS_MODEL,
        prompt: prompt,
        stream: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Local LLM returned non-200 status');
    }

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.warn("Local LLM unavailable, using heuristic simulation:", error);
    
    // Fallback: Simulate local analysis for UI demonstration if Ollama isn't running
    // This ensures the dashboard still functions in "Offline/Demo" mode
    return new Promise(resolve => {
        setTimeout(() => {
            const avgLatency = recentLogs.reduce((acc, log) => acc + log.latency, 0) / recentLogs.length;
            const errorCount = recentLogs.filter(l => l.status >= 400).length;
            const agents = Array.from(new Set(recentLogs.map(l => l.client_agent))).join(', ');
            
            resolve(`**Local Heuristic Report (Offline Mode):**
- **Status**: Ollama unreachable at ${LOCAL_LLM_ENDPOINT}.
- **Traffic Analysis**: Processed ${recentLogs.length} requests locally.
- **Latency**: Average response time is ${Math.round(avgLatency)}ms.
- **Health**: ${errorCount === 0 ? 'System healthy.' : `${errorCount} errors detected.`}
- **Agents**: Detected traffic from ${agents}.
- **Action Required**: Ensure Ollama is running with \`OLLAMA_ORIGINS="*"\`.`);
        }, 1000);
    });
  }
};