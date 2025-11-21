import React from 'react';
import { LogEntry } from '../types';
import { Search, Filter, Download, Clock, Cpu } from 'lucide-react';

interface LogsProps {
  logs: LogEntry[];
}

export const Logs: React.FC<LogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Traffic Logs</h2>
          <p className="text-slate-400 text-sm">Trace requests from agents (LlamaIndex, LangGraph) to backends.</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by Trace ID, Path, or Client Agent..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-700 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Log Table */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Client Agent</th>
                <th className="px-6 py-3 font-medium">Route</th>
                <th className="px-6 py-3 font-medium">Model</th>
                <th className="px-6 py-3 font-medium text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      log.status >= 200 && log.status < 300 ? 'bg-emerald-500/10 text-emerald-400' :
                      log.status >= 400 && log.status < 500 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                        {log.client_agent}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-mono text-xs">{log.method} {log.path}</td>
                  <td className="px-6 py-3 flex items-center gap-2">
                    <Cpu className="w-3 h-3 text-slate-500" />
                    {log.model}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-xs text-slate-400">
                    <span className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {log.latency}ms
                    </span>
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