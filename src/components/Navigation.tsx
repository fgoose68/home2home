import { Building2, Home, LayoutDashboard, BarChart3, Menu, X, Archive } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';
import { ActivePage } from '../lib/types';

interface NavigationProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
}

const navItems = [
  { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'roma' as ActivePage, label: 'Roma', icon: Building2 },
  { id: 'nettuno' as ActivePage, label: 'Nettuno', icon: Home },
  { id: 'statistics' as ActivePage, label: 'Statistiche', icon: BarChart3 },
  { id: 'backup' as ActivePage, label: 'Backup', icon: Archive },
];

export default function Navigation({ activePage, onNavigate }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(page: ActivePage) {
    onNavigate(page);
    setMobileOpen(false);
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size={38} showText={true} />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePage === id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg animate-fade-in">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-3 w-full px-6 py-3 text-sm font-medium transition-colors ${
                activePage === id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
