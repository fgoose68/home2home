import { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import ApartmentPage from './pages/ApartmentPage';
import Statistics from './pages/Statistics';
import { ActivePage } from './lib/types';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'roma': return <ApartmentPage location="Roma" />;
      case 'nettuno': return <ApartmentPage location="Nettuno" />;
      case 'statistics': return <Statistics />;
      default: return <Dashboard onNavigate={setActivePage} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation activePage={activePage} onNavigate={setActivePage} />
      <main className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}
