import React, { useState } from 'react';
import { Play, Send, Terminal } from 'lucide-react';
import { Route } from '../types';

interface PlaygroundProps {
  routes: Route[];
  onSimulateRequest: (routeId: string, prompt: string, agent: string) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ routes, onSimulateRequest }) => {
  const [selectedRoute, setSelectedRoute] = useState(routes[0]?.id || '');
  const [agent, setAgent] = useState('LlamaIndex');
  const [prompt, setPrompt] = useState('Why is the sky blue?');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setResponse('');
    
    // Simulate a request cycle
    setTimeout(() => {
      onSimulateRequest(selectedRoute, prompt, agent);
      setResponse(`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": ${Date.now()},
  "model": "llama3-8b",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "The sky appears blue due to Rayleigh scattering. As sunlight reaches Earth's atmosphere, it collides with gas molecules..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 45,
    "total_tokens": 60
  }
}`);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Gateway Playground</h2>
        <p className="text-slate-400 text-sm">Simulate incoming requests from various agents.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Config Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Route / Endpoint</label>
            <select 
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.path} ({r.strategy})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Simulated Agent</label>
            <select 
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="LlamaIndex">LlamaIndex</option>
              <option value="LangGraph">LangGraph</option>
              <option value="Phidata">Phidata</option>
              <option value="Agno">Agno</option>
              <option value="Direct">Direct Prompt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Input Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-white font-bold transition-all"
          >
            {loading ? <Terminal className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
            {loading ? 'Routing...' : 'Send Request'}
          </button>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-mono text-sm text-slate-400">Response Output</h3>
             {loading && <span className="text-xs text-blue-400 animate-pulse">Processing through Gateway...</span>}
           </div>
           <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 p-4 font-mono text-sm text-green-400 overflow-auto">
              {response ? (
                <pre>{response}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 flex-col gap-2">
                  <Play className="w-8 h-8 opacity-20" />
                  <p>Send a request to see the gateway response</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};