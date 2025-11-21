export enum ProviderType {
  OLLAMA = 'Ollama',
  VLLM = 'vLLM',
  OPENAI = 'OpenAI Compatible',
  ANTHROPIC = 'Anthropic'
}

export interface Route {
  id: string;
  path: string;
  targets: Target[];
  strategy: 'round_robin' | 'lowest_latency' | 'weighted';
  active: boolean;
}

export interface Target {
  id: string;
  name: string;
  provider: ProviderType;
  endpoint: string;
  weight: number;
}

export interface Policy {
  id: string;
  name: string;
  type: 'rate_limit' | 'pii_redaction' | 'cache' | 'auth';
  config: Record<string, any>;
  enabled: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  path: string;
  method: string;
  status: number;
  latency: number;
  tokens_in: number;
  tokens_out: number;
  model: string;
  client_agent: string; // e.g., "LlamaIndex", "LangGraph"
}

export interface MetricPoint {
  time: string;
  requests: number;
  latency: number;
  errors: number;
}