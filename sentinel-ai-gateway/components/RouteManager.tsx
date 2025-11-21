import React from 'react';
import { Route, ProviderType } from '../types';
import { Edit3, Trash2, Plus, Server, GitBranch } from 'lucide-react';

interface RouteManagerProps {
  routes: Route[];
  setRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
}

export const RouteManager: React.FC<RouteManagerProps> = ({ routes, setRoutes }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Route Orchestration</h2>
          <p className="text-slate-400 text-sm">Manage load balancing groups and model endpoints.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Route
        </button>
      </div>

      <div className="space-y-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded text-indigo-400">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-indigo-300">{route.path}</h3>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{route.strategy}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer ml-2">
                  <input type="checkbox" checked={route.active} onChange={() => {}} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="p-4">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="px-4 py-2 rounded-l-lg">Target Name</th>
                    <th className="px-4 py-2">Provider</th>
                    <th className="px-4 py-2">Endpoint</th>
                    <th className="px-4 py-2 rounded-r-lg text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {route.targets.map((target) => (
                    <tr key={target.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-200 flex items-center gap-2">
                        <Server className="w-3 h-3 text-slate-500" />
                        {target.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          target.provider === ProviderType.OLLAMA ? 'bg-orange-500/10 text-orange-400' :
                          target.provider === ProviderType.VLLM ? 'bg-cyan-500/10 text-cyan-400' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {target.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{target.endpoint}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{target.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};