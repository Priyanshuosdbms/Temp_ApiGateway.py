import React from 'react';
import { Icons } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      isActive 
        ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' 
        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
    }`}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Icons.Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-100 tracking-tight">Nexus Gateway</h1>
            <p className="text-xs text-zinc-500 font-mono">v1.2.0-beta</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-zinc-600 px-4 mb-2 uppercase tracking-wider">Platform</div>
          <SidebarItem 
            icon={Icons.Dashboard} 
            label="Dashboard" 
            isActive={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
          />
          <SidebarItem 
            icon={Icons.Routes} 
            label="Routes & Backends" 
            isActive={activeTab === 'routes'} 
            onClick={() => onTabChange('routes')} 
          />
          <SidebarItem 
            icon={Icons.Logs} 
            label="Live Logs" 
            isActive={activeTab === 'logs'} 
            onClick={() => onTabChange('logs')} 
          />
          
          <div className="mt-8 text-xs font-semibold text-zinc-600 px-4 mb-2 uppercase tracking-wider">Tools</div>
          <SidebarItem 
            icon={Icons.Playground} 
            label="Playground" 
            isActive={activeTab === 'playground'} 
            onClick={() => onTabChange('playground')} 
          />
          <SidebarItem 
            icon={Icons.Settings} 
            label="Settings" 
            isActive={activeTab === 'settings'} 
            onClick={() => onTabChange('settings')} 
          />
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-zinc-400">System Operational</span>
            </div>
            <span className="text-xs font-mono text-zinc-600">99.9%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {/* Top Bar */}
         <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-8 backdrop-blur-sm z-10">
            <h2 className="text-lg font-semibold text-zinc-100 capitalize">
              {activeTab === 'routes' ? 'Route Configuration' : activeTab}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center px-3 py-1.5 bg-zinc-800 rounded-md border border-zinc-700/50">
                <Icons.Search className="w-4 h-4 text-zinc-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search request ID..." 
                  className="bg-transparent border-none focus:outline-none text-sm text-zinc-300 w-48" 
                />
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
                <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold">
                  JD
                </div>
              </div>
            </div>
         </header>

         <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
           {children}
         </main>
      </div>
    </div>
  );
};
