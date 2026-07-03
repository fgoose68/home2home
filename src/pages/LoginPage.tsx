import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'fabrizio' && password === 'brizio1968') {
      sessionStorage.setItem('h2h_auth', '1');
      onLogin();
    } else {
      setError('Credenziali non valide.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div
        className={`relative w-full max-w-sm transition-transform ${shake ? 'animate-shake' : ''}`}
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Illustration */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 220 130" width="220" height="130" className="drop-shadow-lg">
              {/* Ground */}
              <rect x="0" y="108" width="220" height="4" rx="2" fill="#475569" opacity="0.5" />

              {/* === Left house === */}
              {/* Body */}
              <rect x="10" y="68" width="64" height="42" rx="3" fill="#f97316" />
              {/* Roof */}
              <polygon points="6,70 42,38 78,70" fill="#ea580c" />
              {/* Door */}
              <rect x="32" y="84" width="20" height="26" rx="3" fill="#7c2d12" />
              {/* Door knob */}
              <circle cx="50" cy="97" r="2" fill="#fbbf24" />
              {/* Window left */}
              <rect x="14" y="74" width="14" height="12" rx="2" fill="#fef3c7" opacity="0.9" />
              <line x1="21" y1="74" x2="21" y2="86" stroke="#f97316" strokeWidth="1.5" />
              <line x1="14" y1="80" x2="28" y2="80" stroke="#f97316" strokeWidth="1.5" />
              {/* Window right */}
              <rect x="56" y="74" width="14" height="12" rx="2" fill="#fef3c7" opacity="0.9" />
              <line x1="63" y1="74" x2="63" y2="86" stroke="#f97316" strokeWidth="1.5" />
              <line x1="56" y1="80" x2="70" y2="80" stroke="#f97316" strokeWidth="1.5" />
              {/* Chimney */}
              <rect x="58" y="44" width="10" height="16" rx="2" fill="#c2410c" />
              {/* Smoke puff 1 */}
              <circle cx="63" cy="38" r="5" fill="white" opacity="0.25" />
              <circle cx="66" cy="32" r="4" fill="white" opacity="0.18" />
              <circle cx="69" cy="27" r="3" fill="white" opacity="0.10" />

              {/* === Palm tree (center) === */}
              {/* Trunk */}
              <path d="M108 108 Q112 90 107 72 Q104 58 110 44" stroke="#92400e" strokeWidth="6" fill="none" strokeLinecap="round" />
              {/* Coconuts */}
              <circle cx="110" cy="48" r="4" fill="#78350f" />
              <circle cx="104" cy="50" r="3.5" fill="#78350f" />
              <circle cx="116" cy="51" r="3.5" fill="#78350f" />
              {/* Leaves */}
              <path d="M110 44 Q95 30 80 32" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M110 44 Q105 26 100 18" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M110 44 Q120 26 128 22" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M110 44 Q125 32 140 34" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M110 44 Q112 30 118 24" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Leaf tips */}
              <ellipse cx="80" cy="32" rx="6" ry="3" fill="#4ade80" transform="rotate(-10 80 32)" />
              <ellipse cx="100" cy="17" rx="5" ry="3" fill="#4ade80" transform="rotate(-30 100 17)" />
              <ellipse cx="128" cy="21" rx="6" ry="3" fill="#4ade80" transform="rotate(20 128 21)" />
              <ellipse cx="140" cy="34" rx="6" ry="3" fill="#4ade80" transform="rotate(10 140 34)" />
              <ellipse cx="118" cy="23" rx="4" ry="2.5" fill="#86efac" transform="rotate(-15 118 23)" />

              {/* === Right house === */}
              {/* Body */}
              <rect x="146" y="68" width="64" height="42" rx="3" fill="#3b82f6" />
              {/* Roof */}
              <polygon points="142,70 178,38 214,70" fill="#2563eb" />
              {/* Door */}
              <rect x="168" y="84" width="20" height="26" rx="3" fill="#1e3a8a" />
              {/* Door knob */}
              <circle cx="170" cy="97" r="2" fill="#fbbf24" />
              {/* Window left */}
              <rect x="150" y="74" width="14" height="12" rx="2" fill="#dbeafe" opacity="0.9" />
              <line x1="157" y1="74" x2="157" y2="86" stroke="#3b82f6" strokeWidth="1.5" />
              <line x1="150" y1="80" x2="164" y2="80" stroke="#3b82f6" strokeWidth="1.5" />
              {/* Window right */}
              <rect x="192" y="74" width="14" height="12" rx="2" fill="#dbeafe" opacity="0.9" />
              <line x1="199" y1="74" x2="199" y2="86" stroke="#3b82f6" strokeWidth="1.5" />
              <line x1="192" y1="80" x2="206" y2="80" stroke="#3b82f6" strokeWidth="1.5" />
              {/* Chimney */}
              <rect x="152" y="44" width="10" height="16" rx="2" fill="#1d4ed8" />
            </svg>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black tracking-tight">
              <span className="text-amber-400">Home</span>
              <span className="text-white">2</span>
              <span className="text-blue-400">hom</span>
              <span className="text-amber-400">E</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gestione spese appartamenti</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Utente
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Inserisci utente"
                autoComplete="username"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Inserisci password"
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium text-center animate-fade-in">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              <LogIn size={16} />
              Accedi
            </button>
          </form>
        </div>

        {/* Bottom label */}
        <p className="text-center text-slate-600 text-xs mt-4">
          Roma &amp; Nettuno &nbsp;·&nbsp; <span className="text-slate-500 font-medium">Ver.3.1Lug2026</span>
        </p>
      </div>
    </div>
  );
}
