
import React from 'react';
import { Icons } from '../components/Icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CHART_DATA } from '../constants';

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-16 h-16" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-5 h-5 ${color.replace('text-', 'text-opacity-80 ')}`} />
        <span className="text-zinc-400 text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-baseline space-x-3">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Internal Requests" value="242.5k" trend={18.2} icon={Icons.Server} color="text-orange-500" />
        <StatCard title="Avg Latency (P95)" value="120ms" trend={-2.1} icon={Icons.Zap} color="text-green-500" />
        <StatCard title="Failed Routes" value="0.01%" trend={-0.5} icon={Icons.Alert} color="text-red-500" />
        <StatCard title="Compute Usage" value="84%" trend={5.4} icon={Icons.Cpu} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-zinc-100 font-semibold mb-6 flex items-center">
            <Icons.Activity className="w-4 h-4 mr-2 text-orange-500" />
            Ingress Traffic (Token Volume)
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#e4e4e7' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-zinc-100 font-semibold mb-6 flex items-center">
            <Icons.Cpu className="w-4 h-4 mr-2 text-purple-500" />
            Model Latency (ms)
          </h3>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'gemma3:8b', value: 120 },
                { name: 'gpt-oss:20b', value: 340 },
                { name: 'llama3:70b', value: 850 },
                { name: 'nomic-embed', value: 45 },
              ]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} hide />
                {/* interval={0} ensures all labels are shown regardless of height */}
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  width={110} 
                  tickLine={false} 
                  axisLine={false}
                  interval={0} 
                />
                <Tooltip cursor={{fill: '#27272a'}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }} />
                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-zinc-100 font-semibold mb-4">Cluster Notices</h3>
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
            <Icons.Alert className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-500">GPU Utilization High</h4>
              <p className="text-xs text-zinc-400 mt-1">Node-3 (llama3:70b) reached 95% VRAM usage.</p>
            </div>
          </div>
          <div className="flex items-start p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
            <Icons.Success className="w-5 h-5 text-blue-500 mt-0.5 mr-3 shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-500">New Model Loaded</h4>
              <p className="text-xs text-zinc-400 mt-1">Successfully pulled 'gemma3:8b' to primary worker pool.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
