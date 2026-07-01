import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ApartmentPage from './pages/ApartmentPage';
import Statistics from './pages/Statistics';
import BackupPage from './pages/BackupPage';
import LoginPage from './pages/LoginPage';
import { ActivePage } from './lib/types';

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('h2h_auth') === '1');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  function handleLogout() {
    sessionStorage.removeItem('h2h_auth');
    setAuthed(false);
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'roma': return <ApartmentPage location="Roma" />;
      case 'nettuno': return <ApartmentPage location="Nettuno" />;
      case 'statistics': return <Statistics />;
      case 'backup': return <BackupPage />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
      <main className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}
