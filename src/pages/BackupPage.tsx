import { useEffect, useRef, useState } from 'react';
import {
  Download, Upload, CheckCircle2, AlertCircle, Archive,
  RefreshCw, Trash2, FolderOpen, FileText,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, ApartmentDocument, Expense, ExpenseCategory } from '../lib/types';

interface BackupPayload {
  version: number;
  exported_at: string;
  apartments: Apartment[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  documents: ApartmentDocument[];
}

type Status = { type: 'success' | 'error'; message: string } | null;

export default function BackupPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<ApartmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [a, c, e, d] = await Promise.all([
      supabase.from('apartments').select('*').order('name'),
      supabase.from('expense_categories').select('*').order('sort_order'),
      supabase.from('expenses').select('*').order('expense_date'),
      supabase.from('apartment_documents').select('*').order('uploaded_at', { ascending: false }),
    ]);
    setApartments(a.data ?? []);
    setCategories(c.data ?? []);
    setExpenses(e.data ?? []);
    setDocuments(d.data ?? []);
    setLoading(false);
  }

  function handleExport() {
    const payload: BackupPayload = {
      version: 2,
      exported_at: new Date().toISOString(),
      apartments,
      categories,
      expenses,
      documents,
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
    setStatus({
      type: 'success',
      message: `Backup esportato: ${expenses.length} spese, ${documents.length} referenze documenti.`,
    });
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

      // Restore expenses
      const toRestoreExp = payload.expenses.map(({ category, ...exp }) => exp);
      const { error: expErr, count: expCount } = await supabase
        .from('expenses')
        .upsert(toRestoreExp, { onConflict: 'id', count: 'exact' });
      if (expErr) throw expErr;

      // Restore document metadata (v2+)
      let docCount = 0;
      if (payload.version >= 2 && Array.isArray(payload.documents) && payload.documents.length > 0) {
        const { error: docErr, count } = await supabase
          .from('apartment_documents')
          .upsert(payload.documents, { onConflict: 'id', count: 'exact' });
        if (docErr) throw docErr;
        docCount = count ?? payload.documents.length;
      }

      await load();
      setStatus({
        type: 'success',
        message: `Ripristino completato: ${expCount ?? toRestoreExp.length} spese${docCount > 0 ? `, ${docCount} referenze documenti` : ''} elaborate. Backup del ${new Date(payload.exported_at).toLocaleDateString('it-IT')}.`,
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message ?? 'Errore durante il ripristino.' });
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteExpenses() {
    if (!window.confirm("Eliminare TUTTE le spese? Questa operazione non e' reversibile (a meno che tu non abbia un backup).")) return;
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

  const docsByApt = apartments.map((apt) => ({
    apt,
    count: documents.filter((d) => d.apartment_id === apt.id).length,
  }));

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
          {status.type === 'success'
            ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
            : <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
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
          <>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Appartamenti', value: apartments.length, icon: null },
                { label: 'Categorie', value: categories.length, icon: null },
                { label: 'Spese', value: expenses.length, icon: null },
                { label: 'Documenti', value: documents.length, icon: null },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-black text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Expenses by year */}
            {years.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Spese per anno</p>
                <div className="space-y-1.5">
                  {years.map((y) => (
                    <div key={y} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700 w-12">{y}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-slate-600 h-1.5 rounded-full"
                          style={{ width: `${(byYear[y] / Math.max(...Object.values(byYear))) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums w-16 text-right">{byYear[y]} spese</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents by apartment */}
            {documents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Documenti per appartamento</p>
                <div className="space-y-1.5">
                  {docsByApt.map(({ apt, count }) => {
                    const isOrange = apt.color_theme === 'orange';
                    return (
                      <div key={apt.id} className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 w-28 flex-shrink-0`}>
                          <FolderOpen size={13} className={isOrange ? 'text-orange-500' : 'text-blue-500'} />
                          <span className="text-sm font-semibold text-slate-700 truncate">{apt.location}</span>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${isOrange ? 'bg-orange-400' : 'bg-blue-400'}`}
                            style={{ width: documents.length > 0 ? `${(count / documents.length) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums w-20 text-right">{count} doc</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
            <Download size={16} className="text-slate-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Esporta backup</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Scarica un file <code className="bg-slate-100 px-1 rounded text-xs">.json</code> con spese, categorie e referenze documenti.
              I file caricati nella sezione Documenti sono al sicuro su Supabase Storage.
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={loading || (expenses.length === 0 && documents.length === 0)}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Scarica backup JSON
        </button>
      </div>

      {/* Documents note */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <FileText size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700 mb-1">File documenti</h2>
            <p className="text-sm text-slate-500">
              I <strong className="text-slate-700">{documents.length} file</strong> caricati nella sezione Documenti sono conservati su
              Supabase Storage (cloud). Le loro informazioni (nome, anno, note) vengono incluse nel backup JSON.
              In caso di ripristino da backup, i metadati vengono recuperati automaticamente; i file fisici rimangono su Storage e non richiedono ri-caricamento.
            </p>
          </div>
        </div>
      </div>

      {/* Import */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
            <Upload size={16} className="text-slate-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Ripristina da backup</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Carica un file di backup. Spese e referenze documenti vengono aggiornate o reinserite senza duplicati.
            </p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
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
          Elimina tutte le spese dal database. Appartamenti, categorie e documenti rimangono intatti.
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
