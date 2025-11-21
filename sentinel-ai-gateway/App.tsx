import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RouteManager } from './components/RouteManager';
import { PolicyConfig } from './components/PolicyConfig';
import { Logs } from './components/Logs';
import { Playground } from './components/Playground';
import { Route, ProviderType, Policy, LogEntry, MetricPoint } from './types';

// --- Mock Initial Data ---
const INITIAL_ROUTES: Route[] = [
  {
    id: 'r1',
    path: '/v1/chat/completions',
    strategy: 'weighted',
    active: true,
    targets: [
      { id: 't1', name: 'Ollama (local GPU)', provider: ProviderType.OLLAMA, endpoint: 'http://10.0.0.4:11434', weight: 70 },
      { id: 't2', name: 'vLLM (Backup)', provider: ProviderType.VLLM, endpoint: 'http://10.0.0.5:8000', weight: 30 },
    ]
  },
  {
    id: 'r2',
    path: '/v1/embeddings',
    strategy: 'lowest_latency',
    active: true,
    targets: [
      { id: 't3', name: 'vLLM Embed', provider: ProviderType.VLLM, endpoint: 'http://10.0.0.5:8000', weight: 100 },
    ]
  }
];

const INITIAL_POLICIES: Policy[] = [
  { id: 'p1', name: 'Rate Limiting (Global)', type: 'rate_limit', enabled: true, config: { rpm: 1000, burst: 50 } },
  { id: 'p2', name: 'PII Redaction', type: 'pii_redaction', enabled: true, config: { entities: ['EMAIL', 'PHONE', 'SSN'], replacement: '[REDACTED]' } },
  { id: 'p3', name: 'Require API Key', type: 'auth', enabled: true, config: { method: 'Bearer Token' } }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);

  // Generate mock logs on mount
  useEffect(() => {
    const generatedLogs: LogEntry[] = Array.from({ length: 15 }).map((_, i) => ({
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(Date.now() - i * 1000 * 60).toISOString(),
      path: '/v1/chat/completions',
      method: 'POST',
      status: Math.random() > 0.9 ? 429 : 200,
      latency: Math.floor(Math.random() * 200) + 50,
      tokens_in: Math.floor(Math.random() * 500),
      tokens_out: Math.floor(Math.random() * 200),
      model: 'llama3-8b',
      client_agent: ['LlamaIndex', 'LangGraph', 'Direct'][Math.floor(Math.random() * 3)]
    }));
    setLogs(generatedLogs);

    const generatedMetrics: MetricPoint[] = Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      requests: Math.floor(Math.random() * 1000) + 500,
      latency: Math.floor(Math.random() * 50) + 100,
      errors: Math.floor(Math.random() * 10)
    }));
    setMetrics(generatedMetrics);
  }, []);

  const handleSimulateRequest = (routeId: string, prompt: string, agent: string) => {
    const route = routes.find(r => r.id === routeId);
    const newLog: LogEntry = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      path: route?.path || '/unknown',
      method: 'POST',
      status: 200,
      latency: Math.floor(Math.random() * 100) + 50,
      tokens_in: prompt.length / 4,
      tokens_out: 50, // mock
      model: route?.targets[0].name || 'unknown',
      client_agent: agent
    };
    setLogs(prev => [newLog, ...prev]);
    
    // Update metrics slightly
    setMetrics(prev => {
       const last = prev[prev.length - 1];
       const newPoint = { ...last, requests: last.requests + 1 };
       return [...prev.slice(0, -1), newPoint];
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard metrics={metrics} recentLogs={logs} />;
      case 'routes':
        return <RouteManager routes={routes} setRoutes={setRoutes} />;
      case 'policies':
        return <PolicyConfig policies={policies} setPolicies={setPolicies} />;
      case 'logs':
        return <Logs logs={logs} />;
      case 'playground':
        return <Playground routes={routes} onSimulateRequest={handleSimulateRequest} />;
      default:
        return <div className="text-slate-500 p-10">Setting page placeholder</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;