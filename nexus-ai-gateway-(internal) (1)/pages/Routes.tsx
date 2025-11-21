
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { ProviderType, ModelInfo } from '../types';
import { getRunningModels } from '../services/geminiService';

interface BackendStatus {
  id: string;
  name: string;
  endpoint: string;
  provider: ProviderType;
  isOnline: boolean;
  lastCheck: Date | null;
  models: ModelInfo[];
}

const DEFAULT_BACKENDS: BackendStatus[] = [
  {
    id: 'local-ollama',
    name: 'Local Ollama',
    endpoint: 'http://localhost:11434',
    provider: ProviderType.OLLAMA,
    isOnline: false,
    lastCheck: null,
    models: []
  },
  {
    id: 'local-vllm',
    name: 'Local vLLM',
    endpoint: 'http://localhost:8000',
    provider: ProviderType.VLLM,
    isOnline: false,
    lastCheck: null,
    models: []
  }
];

export const RoutesPage: React.FC = () => {
  const [backends, setBackends] = useState<BackendStatus[]>(DEFAULT_BACKENDS);
  const [isScanning, setIsScanning] = useState(false);

  const scanNetwork = async () => {
    setIsScanning(true);
    const updatedBackends = [...backends];

    for (let i = 0; i < updatedBackends.length; i++) {
      const backend = updatedBackends[i];
      try {
        const models = await getRunningModels(backend.provider, backend.endpoint);
        updatedBackends[i] = {
          ...backend,
          isOnline: models.length > 0, // If we get models, it's online
          lastCheck: new Date(),
          models: models
        };
      } catch (e) {
        updatedBackends[i] = {
          ...backend,
          isOnline: false,
          lastCheck: new Date(),
          models: []
        };
      }
    }

    setBackends(updatedBackends);
    setIsScanning(false);
  };

  useEffect(() => {
    scanNetwork();
  }, []);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Discovery & Routing</h3>
          <p className="text-zinc-400 text-sm">Scanning local network for active inference engines.</p>
        </div>
        <button 
          onClick={scanNetwork}
          disabled={isScanning}
          className={`px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center border border-zinc-700 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Icons.Network className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Refresh Network'}
        </button>
      </div>

      <div className="grid gap-6">
        {backends.map((backend) => (
          <div key={backend.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Backend Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  backend.isOnline 
                    ? (backend.provider === ProviderType.OLLAMA ? 'bg-orange-900/20 text-orange-400' : 'bg-purple-900/20 text-purple-400')
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <Icons.Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 flex items-center space-x-2">
                    <span>{backend.name}</span>
                    {backend.isOnline ? (
                      <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-900/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Online</span>
                    ) : (
                      <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-900/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Unreachable</span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">{backend.endpoint}</p>
                </div>
              </div>
              <div className="text-right text-xs text-zinc-600">
                {backend.lastCheck ? `Last scan: ${backend.lastCheck.toLocaleTimeString()}` : 'Never scanned'}
              </div>
            </div>

            {/* Models List */}
            <div className="p-4">
               {backend.models.length > 0 ? (
                 <div className="space-y-2">
                    <div className="grid grid-cols-12 text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 px-2">
                      <div className="col-span-6">Model Name</div>
                      <div className="col-span-3">Size / Info</div>
                      <div className="col-span-3 text-right">Status</div>
                    </div>
                    {backend.models.map((model) => (
                      <div key={model.id} className="grid grid-cols-12 items-center p-2 hover:bg-zinc-800/50 rounded-lg transition-colors group">
                         <div className="col-span-6 flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-zinc-300 font-mono">{model.name}</span>
                         </div>
                         <div className="col-span-3 text-xs text-zinc-500">
                            {model.size ? formatBytes(model.size) : model.details}
                         </div>
                         <div className="col-span-3 flex justify-end">
                           <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                             Ready
                           </span>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-8">
                   <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-600">
                     <Icons.Alert className="w-6 h-6" />
                   </div>
                   <p className="text-zinc-400 text-sm font-medium">No models detected</p>
                   <p className="text-zinc-600 text-xs mt-1 max-w-xs mx-auto">
                     Ensure {backend.name} is running at <span className="font-mono">{backend.endpoint}</span> and CORS is configured.
                   </p>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500 mb-2">Auto-Discovery Information</p>
        <p className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed">
          The Gateway actively queries standard endpoints (<code>/api/tags</code> for Ollama, <code>/v1/models</code> for vLLM). 
          Models appearing here are instantly available in the Playground and accessible via the generic gateway route.
        </p>
      </div>
    </div>
  );
};
