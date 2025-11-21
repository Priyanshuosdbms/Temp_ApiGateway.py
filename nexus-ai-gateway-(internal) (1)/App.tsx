import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RoutesPage } from './pages/Routes';
import { LogsPage } from './pages/Logs';
import { Playground } from './pages/Playground';

const SettingsPage = () => (
  <div className="text-zinc-400">
    <h3 className="text-xl font-semibold text-white mb-4">Global Settings</h3>
    <p>Gateway configuration, API keys management, and user access controls would go here.</p>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'routes': return <RoutesPage />;
      case 'logs': return <LogsPage />;
      case 'playground': return <Playground />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
