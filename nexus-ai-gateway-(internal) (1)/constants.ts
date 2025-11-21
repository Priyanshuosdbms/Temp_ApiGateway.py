
import { ProviderType, RequestLog, RouteConfig } from './types';

export const INITIAL_ROUTES: RouteConfig[] = [
  {
    id: 'route-1',
    name: 'Gemma 3 (General)',
    provider: ProviderType.OLLAMA,
    modelName: 'gemma3:8b',
    endpoint: 'http://localhost:11434',
    isEnabled: true,
    priority: 1,
    latencyMs: 120,
  },
  {
    id: 'route-2',
    name: 'Llama 3 (Reasoning)',
    provider: ProviderType.OLLAMA,
    modelName: 'llama3:70b',
    endpoint: 'http://localhost:11434',
    isEnabled: true,
    priority: 2,
    latencyMs: 850,
  },
  {
    id: 'route-3',
    name: 'GPT OSS (Coding)',
    provider: ProviderType.OLLAMA,
    modelName: 'gpt-oss:20b',
    endpoint: 'http://localhost:11434',
    isEnabled: true,
    priority: 3,
    latencyMs: 340,
  },
  {
    id: 'route-4',
    name: 'Nomic Embed (Vector)',
    provider: ProviderType.OLLAMA,
    modelName: 'nomic-latest-embed:latest',
    endpoint: 'http://localhost:11434',
    isEnabled: true,
    priority: 4,
    latencyMs: 45,
  },
  {
    id: 'route-5',
    name: 'vLLM Inference',
    provider: ProviderType.VLLM,
    modelName: 'mistral-7b-instruct-v0.3',
    endpoint: 'http://localhost:8000',
    isEnabled: false,
    priority: 5,
    latencyMs: 90,
  }
];

export const MOCK_LOGS: RequestLog[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `req_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(Date.now() - i * 1000 * 45 * (Math.random() * 10)).toISOString(),
  routeId: i % 4 === 0 ? 'route-1' : i % 4 === 1 ? 'route-2' : i % 4 === 2 ? 'route-3' : 'route-4',
  status: Math.random() > 0.98 ? 503 : 200,
  latency: Math.floor(Math.random() * 600) + 50,
  tokensIn: Math.floor(Math.random() * 800) + 100,
  tokensOut: Math.floor(Math.random() * 1500) + 200,
  preview: "Retrieve context from index and formulate answer...",
  client: Math.random() > 0.7 ? "LlamaIndex Agent (RAG)" : "LlamaIndex Agent (Planner)",
}));

export const CHART_DATA = [
  { time: '00:00', requests: 240, latency: 150 },
  { time: '04:00', requests: 180, latency: 140 },
  { time: '08:00', requests: 850, latency: 450 },
  { time: '12:00', requests: 1450, latency: 620 },
  { time: '16:00', requests: 1250, latency: 580 },
  { time: '20:00', requests: 640, latency: 280 },
  { time: '23:59', requests: 390, latency: 200 },
];
