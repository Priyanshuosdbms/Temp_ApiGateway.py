import React from 'react';
import { MOCK_LOGS } from '../constants';

export const LogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Live Traffic (Internal)</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded border border-zinc-700">Export JSON</button>
          <button className="px-3 py-1.5 text-xs bg-orange-600 hover:bg-orange-500 text-white rounded">Live View: ON</button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-6 py-3 font-medium text-zinc-400">Timestamp</th>
                <th className="px-6 py-3 font-medium text-zinc-400">Request ID</th>
                <th className="px-6 py-3 font-medium text-zinc-400">Client</th>
                <th className="px-6 py-3 font-medium text-zinc-400">Route / Model</th>
                <th className="px-6 py-3 font-medium text-zinc-400">Status</th>
                <th className="px-6 py-3 font-medium text-zinc-400">Latency</th>
                <th className="px-6 py-3 font-medium text-zinc-400">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-3 text-zinc-500 whitespace-nowrap font-mono text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3 text-zinc-300 font-mono text-xs">{log.id}</td>
                  <td className="px-6 py-3 text-zinc-300">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {log.client}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      log.routeId === 'route-1' ? 'bg-orange-900/20 border-orange-900/30 text-orange-400' :
                      log.routeId === 'route-2' ? 'bg-blue-900/20 border-blue-900/30 text-blue-400' :
                      log.routeId === 'route-5' ? 'bg-purple-900/20 border-purple-900/30 text-purple-400' :
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                       {log.routeId === 'route-1' ? 'gemma3:8b' : 
                        log.routeId === 'route-2' ? 'llama3:70b' : 
                        log.routeId === 'route-3' ? 'gpt-oss:20b' : 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center ${log.status === 200 ? 'text-green-500' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${log.status === 200 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-400 font-mono text-xs">{log.latency}ms</td>
                  <td className="px-6 py-3 text-zinc-500 text-xs font-mono">
                    {log.tokensIn + log.tokensOut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};