import { useEffect, useRef, useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, Archive, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, Expense, ExpenseCategory } from '../lib/types';

interface BackupPayload {
  version: number;
  exported_at: string;
  apartments: Apartment[];
  categories: ExpenseCategory[];
  expenses: Expense[];
}

type Status = { type: 'success' | 'error'; message: string } | null;

export default function BackupPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [a, c, e] = await Promise.all([
      supabase.from('apartments').select('*').order('name'),
      supabase.from('expense_categories').select('*').order('sort_order'),
      supabase.from('expenses').select('*').order('expense_date'),
    ]);
    setApartments(a.data ?? []);
    setCategories(c.data ?? []);
    setExpenses(e.data ?? []);
    setLoading(false);
  }

  function handleExport() {
    const payload: BackupPayload = {
      version: 1,
      exported_at: new Date().toISOString(),
      apartments,
      categories,
      expenses,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `h2h_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', message: `Backup esportato: ${expenses.length} spese, ${categories.length} categorie.` });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setBusy(true);
    setStatus(null);
    try {
      const text = await file.text();
      const payload: BackupPayload = JSON.parse(text);
      if (!payload.version || !Array.isArray(payload.expenses)) {
        throw new Error('File non valido o formato non riconosciuto.');
      }

      // Upsert expenses only (apartments & categories are static config)
      const toRestore = payload.expenses.map(({ category, ...exp }) => exp);
      const { error, count } = await supabase
        .from('expenses')
        .upsert(toRestore, { onConflict: 'id', count: 'exact' });

      if (error) throw error;

      await load();
      setStatus({
        type: 'success',
        message: `Ripristino completato: ${count ?? toRestore.length} spese elaborate (inserite o aggiornate). Backup del ${new Date(payload.exported_at).toLocaleDateString('it-IT')}.`,
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message ?? 'Errore durante il ripristino.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteExpenses() {
    if (!window.confirm('Eliminare TUTTE le spese? Questa operazione non e\' reversibile (a meno che tu non abbia un backup).')) return;
    setBusy(true);
    setStatus(null);
    const { error } = await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      await load();
      setStatus({ type: 'success', message: 'Tutte le spese sono state eliminate.' });
    }
    setBusy(false);
  }

  const byYear = expenses.reduce<Record<number, number>>((acc, e) => {
    acc[e.year] = (acc[e.year] ?? 0) + 1;
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-slate-800 rounded-xl text-white">
            <Archive size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Backup & Ripristino</h1>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Esporta tutti i dati in un file JSON oppure ripristinali da un backup precedente.
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
          status.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Database summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700">Stato del database</h2>
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Aggiorna"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-1/3" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Appartamenti', value: apartments.length },
              { label: 'Categorie', value: categories.length },
              { label: 'Spese totali', value: expenses.length },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-2xl font-black text-slate-800">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
        {years.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Spese per anno</p>
            {years.map((y) => (
              <div key={y} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700 w-12">{y}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-600 h-2 rounded-full"
                    style={{ width: `${(byYear[y] / Math.max(...Object.values(byYear))) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 tabular-nums w-16 text-right">{byYear[y]} spese</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-1">Esporta backup</h2>
        <p className="text-sm text-slate-500 mb-4">
          Scarica un file <code className="bg-slate-100 px-1 rounded text-xs">.json</code> con tutti gli appartamenti, categorie e spese.
          Conservalo in un posto sicuro (cloud, chiavetta USB, email).
        </p>
        <button
          onClick={handleExport}
          disabled={loading || expenses.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Scarica backup JSON
        </button>
      </div>

      {/* Import */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-1">Ripristina da backup</h2>
        <p className="text-sm text-slate-500 mb-4">
          Carica un file di backup precedentemente esportato. Le spese esistenti vengono aggiornate; quelle mancanti vengono reinserite.
          <strong className="text-slate-700"> Le spese gia presenti non vengono duplicate.</strong>
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
          {busy ? 'Ripristino in corso…' : 'Carica file di backup'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-red-700 mb-1">Zona pericolosa</h2>
        <p className="text-sm text-slate-500 mb-4">
          Elimina tutte le spese dal database. Gli appartamenti e le categorie rimangono intatti.
          <strong className="text-slate-700"> Esegui un backup prima di procedere.</strong>
        </p>
        <button
          onClick={handleDeleteExpenses}
          disabled={busy || expenses.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={16} />
          Elimina tutte le spese
        </button>
      </div>
    </div>
  );
}
