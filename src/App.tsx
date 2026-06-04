import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { LampadairesView } from './components/Lampadaires/LampadairesView';
import { HistoryView } from './components/History/HistoryView';
import { ConfigurationView } from './components/Configuration/ConfigurationView';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'lampadaires' && <LampadairesView />}
          {activeTab === 'historique' && <HistoryView />}
          {activeTab === 'configuration' && <ConfigurationView />}
        </div>
      </main>
    </div>
  );
}

export default App;