import { useEffect, useState } from 'react';
import {
  Bell, BellOff, Save, Send, CheckCircle2, AlertCircle,
  Eye, EyeOff, Settings, RefreshCw, ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Settings as SettingsType } from '../lib/types';

type Status = { type: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [userKey, setUserKey] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showUserKey, setShowUserKey] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (data) {
      setSettings(data);
      setUserKey(data.pushover_user_key ?? '');
      setApiToken(data.pushover_api_token ?? '');
      setEnabled(data.notifications_enabled);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 1,
        pushover_user_key: userKey.trim() || null,
        pushover_api_token: apiToken.trim() || null,
        notifications_enabled: enabled,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Impostazioni salvate correttamente.' });
      await load();
    }
    setSaving(false);
  }

  async function handleTest() {
    if (!userKey.trim() || !apiToken.trim()) {
      setStatus({ type: 'error', message: 'Inserisci e salva prima le credenziali Pushover.' });
      return;
    }
    setTesting(true);
    setStatus(null);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`;
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ test: true }),
      });
      const result = await resp.json();
      if (!resp.ok || result.error) {
        setStatus({ type: 'error', message: result.error ?? `Errore ${resp.status}` });
      } else {
        setStatus({ type: 'success', message: result.message ?? 'Notifica di test inviata.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message ?? 'Errore di rete.' });
    } finally {
      setTesting(false);
    }
  }

  const isDirty =
    userKey !== (settings?.pushover_user_key ?? '') ||
    apiToken !== (settings?.pushover_api_token ?? '') ||
    enabled !== (settings?.notifications_enabled ?? false);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-slate-800 rounded-xl text-white">
            <Settings size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Impostazioni</h1>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Configura le notifiche push per le scadenze delle spese.
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
          status.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {status.type === 'success'
            ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Pushover config card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm">
              <Bell size={18} className="text-slate-700" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Notifiche Pushover</h2>
              <p className="text-xs text-slate-500">Avvisi push il giorno della scadenza alle 11:15</p>
            </div>
          </div>
          {/* Enable toggle */}
          <button
            onClick={() => setEnabled(!enabled)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              enabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
            title={enabled ? 'Disabilita notifiche' : 'Abilita notifiche'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-slate-100 rounded-lg" />
              <div className="h-10 bg-slate-100 rounded-lg" />
            </div>
          ) : (
            <>
              {/* Status badge */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-fit ${
                enabled && userKey && apiToken
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {enabled && userKey && apiToken
                  ? <><Bell size={13} /> Notifiche attive — ogni giorno alle 11:15 (ora italiana estiva)</>
                  : <><BellOff size={13} /> Notifiche disabilitate</>
                }
              </div>

              {/* User Key */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  User Key
                  <span className="text-slate-400 font-normal ml-1">(chiave utente Pushover)</span>
                </label>
                <div className="relative">
                  <input
                    type={showUserKey ? 'text' : 'password'}
                    value={userKey}
                    onChange={(e) => setUserKey(e.target.value)}
                    placeholder="u1abc2def3ghi4jkl5mno6pqr"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserKey(!showUserKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showUserKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* API Token */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  API Token
                  <span className="text-slate-400 font-normal ml-1">(token applicazione Pushover)</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiToken ? 'text' : 'password'}
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    placeholder="azGDORePK8gMaC0QOYAMyEEuzJnyUi"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiToken(!showApiToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? 'Salvataggio…' : 'Salva'}
                </button>

                <button
                  onClick={handleTest}
                  disabled={testing || !userKey.trim() || !apiToken.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {testing ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {testing ? 'Invio…' : 'Invia notifica di test'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-700">Come funziona</h3>
        <ol className="text-sm text-slate-600 space-y-2 list-none">
          {[
            'Ogni mattina alle 11:15 il sistema verifica se ci sono spese con data di scadenza uguale ad oggi e stato "Da pagare".',
            'Per ciascuna spesa in scadenza viene inviata una notifica push al tuo dispositivo tramite Pushover.',
            'La notifica indica l\'appartamento, la categoria, l\'importo e il periodo della spesa.',
            'Se più spese scadono nello stesso giorno riceverai una notifica per ognuna.',
          ].map((text, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ottenere le credenziali Pushover</p>
          <ul className="text-sm text-slate-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span><strong className="text-slate-700">User Key</strong> — visibile nella schermata principale dell'app Pushover o su pushover.net dopo il login.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5">•</span>
              <span><strong className="text-slate-700">API Token</strong> — crea un'applicazione su pushover.net → <em>Your Applications</em> → <em>Create an Application</em>. Il token viene mostrato dopo la creazione.</span>
            </li>
          </ul>
          <a
            href="https://pushover.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ExternalLink size={12} />
            pushover.net
          </a>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800">
            <strong>Nota sull'orario:</strong> Le notifiche automatiche sono programmate alle 9:15 UTC, che corrisponde alle <strong>11:15 ora italiana estiva</strong> (CEST, UTC+2).
            In inverno (CET, UTC+1) l'arrivo si sposta alle 10:15.
          </p>
        </div>
      </div>
    </div>
  );
}
