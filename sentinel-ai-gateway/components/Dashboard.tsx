import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Sparkles, ArrowUpRight, ArrowDownRight, Activity, Zap, ShieldCheck } from 'lucide-react';
import { MetricPoint } from '../types';
import { analyzeGatewayTraffic } from '../services/analysisService';
import { LogEntry } from '../types';

interface DashboardProps {
  metrics: MetricPoint[];
  recentLogs: LogEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, recentLogs }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeGatewayTraffic(recentLogs);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Traffic Overview</h2>
          <p className="text-slate-400 text-sm">Real-time monitoring of local orchestration and latency</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Local Only
          </span>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Running Local Model...' : 'Analyze Logs'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requests" value="1.2M" change="+12.5%" isPositive={true} icon={Activity} />
        <StatCard title="Avg Latency" value="145ms" change="-8.2%" isPositive={true} icon={Zap} />
        <StatCard title="Error Rate" value="0.04%" change="+0.01%" isPositive={false} icon={ArrowDownRight} />
        <StatCard title="Saved Cost (vs Cloud)" value="$420.50" change="+12.4%" isPositive={true} icon={ArrowUpRight} />
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-400 mb-3">
            <Sparkles className="w-5 h-5" /> Local SRE Report
          </h3>
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-line text-slate-300">
            {analysis}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Request Volume (RPM)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#6ee7b7' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#10b981" fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-200">Latency Distribution (ms)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  cursor={{fill: '#1e293b'}}
                />
                <Bar dataKey="latency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-start justify-between hover:border-slate-700 transition-colors">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        <span>{change}</span>
        <span>from last hour</span>
      </div>
    </div>
    <div className="p-3 bg-slate-800 rounded-lg">
      <Icon className="w-5 h-5 text-slate-400" />
    </div>
  </div>
);