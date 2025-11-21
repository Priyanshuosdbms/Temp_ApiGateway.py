import React from 'react';
import { Policy } from '../types';
import { Shield, Lock, EyeOff, AlertTriangle } from 'lucide-react';

interface PolicyConfigProps {
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
}

export const PolicyConfig: React.FC<PolicyConfigProps> = ({ policies, setPolicies }) => {
  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pii_redaction': return EyeOff;
      case 'rate_limit': return AlertTriangle;
      case 'auth': return Lock;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Policies</h2>
          <p className="text-slate-400 text-sm">Enforce guardrails for LLM interactions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy) => {
          const Icon = getIcon(policy.type);
          return (
            <div key={policy.id} className={`border rounded-xl p-6 transition-all duration-300 ${
              policy.enabled 
                ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-900/10' 
                : 'bg-slate-900/50 border-slate-800 opacity-75'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${policy.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{policy.name}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-1">{policy.type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={policy.enabled} 
                    onChange={() => togglePolicy(policy.id)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="mt-6">
                <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-400 border border-slate-800">
                  <pre>{JSON.stringify(policy.config, null, 2)}</pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};