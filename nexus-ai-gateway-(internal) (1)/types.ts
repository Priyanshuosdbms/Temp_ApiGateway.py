
export enum ProviderType {
  OLLAMA = 'OLLAMA',
  VLLM = 'VLLM',
  MOCK = 'MOCK'
}

export enum DiscoveryStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ModelInfo {
  id: string;
  name: string;
  size?: number; // Size in bytes
  details?: string; // Quantization level etc
}

export interface RouteConfig {
  id: string;
  name: string;
  provider: ProviderType;
  modelName: string;
  endpoint: string;
  apiKey?: string;
  isEnabled: boolean;
  priority: number;
  latencyMs: number;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  routeId: string;
  status: number;
  latency: number;
  tokensIn: number;
  tokensOut: number;
  preview: string;
  client: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface GatewayStats {
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
  computeCost: number;
}
