import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileText, FileImage, FileSpreadsheet, File, Download, Trash2,
  Upload, AlertCircle, CheckCircle2, Loader2, X,
  ChevronDown, ChevronRight, FolderOpen,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, ApartmentDocument } from '../lib/types';

const BUCKET = 'apartment-docs';
const MAX_MB = 50;
const CURRENT_YEAR = new Date().getFullYear();
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - 5 + i);

function fileIcon(mime: string) {
  if (mime === 'application/pdf') return <FileText size={16} className="text-red-500 flex-shrink-0" />;
  if (mime.startsWith('image/')) return <FileImage size={16} className="text-blue-500 flex-shrink-0" />;
  if (mime.includes('excel') || mime.includes('spreadsheet')) return <FileSpreadsheet size={16} className="text-green-600 flex-shrink-0" />;
  if (mime.includes('word') || mime.includes('document')) return <FileText size={16} className="text-blue-700 flex-shrink-0" />;
  return <File size={16} className="text-slate-400 flex-shrink-0" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

// ─── Year accordion ───────────────────────────────────────────────────────────

interface YearSectionProps {
  year: number;
  docs: ApartmentDocument[];
  isOrange: boolean;
  defaultOpen: boolean;
  onDownload: (doc: ApartmentDocument) => void;
  onDelete: (doc: ApartmentDocument) => void;
  deleting: string | null;
}

function YearSection({ year, docs, isOrange, defaultOpen, onDownload, onDelete, deleting }: YearSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const pill = isOrange ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
          <span className="text-sm font-bold text-slate-700">{year}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pill}`}>
            {docs.length}
          </span>
        </div>
      </button>
      {open && (
        <div className="divide-y divide-slate-100">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 transition-colors group">
              {fileIcon(doc.mime_type)}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{doc.name}</p>
                {doc.description && (
                  <p className="text-xs text-slate-400 truncate">{doc.description}</p>
                )}
                <p className="text-xs text-slate-400">{formatSize(doc.file_size)} · {formatDate(doc.uploaded_at)}</p>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onDownload(doc)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Scarica"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => onDelete(doc)}
                  disabled={deleting === doc.id}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  title="Elimina"
                >
                  {deleting === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Apartment panel ──────────────────────────────────────────────────────────

interface ApartmentPanelProps {
  apartment: Apartment;
  docs: ApartmentDocument[];
  onUploaded: () => void;
  onDeleted: (doc: ApartmentDocument) => void;
}

function ApartmentPanel({ apartment, docs, onUploaded, onDeleted }: ApartmentPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [modal, setModal] = useState<{ file: File } | null>(null);
  const [description, setDescription] = useState('');
  const [docYear, setDocYear] = useState(CURRENT_YEAR);

  const isOrange = apartment.color_theme === 'orange';
  const accent = isOrange
    ? { bar: 'bg-orange-500', ring: 'ring-orange-300', text: 'text-orange-600', border: 'border-orange-300', light: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-400' }
    : { bar: 'bg-blue-500', ring: 'ring-blue-300', text: 'text-blue-600', border: 'border-blue-300', light: 'bg-blue-50', btn: 'bg-blue-500 hover:bg-blue-400' };

  function showNotice(type: 'success' | 'error', msg: string) {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  function pickFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) { showNotice('error', `Tipo non supportato: ${file.type || '?'}`); return; }
    if (file.size > MAX_MB * 1024 * 1024) { showNotice('error', `Max ${MAX_MB} MB`); return; }
    setDescription('');
    setDocYear(CURRENT_YEAR);
    setModal({ file });
  }

  async function doUpload(file: File, desc: string, year: number) {
    setModal(null);
    setUploading(true);
    setProgress(file.name);
    try {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${apartment.id}/${year}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}_${safeName}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { error: dbErr } = await supabase.from('apartment_documents').insert({
        apartment_id: apartment.id, name: file.name, description: desc.trim() || null,
        storage_path: path, file_size: file.size, mime_type: file.type, doc_year: year,
      });
      if (dbErr) { await supabase.storage.from(BUCKET).remove([path]); throw dbErr; }
      showNotice('success', `"${file.name}" caricato (${year}).`);
      onUploaded();
    } catch (err: any) {
      showNotice('error', err.message ?? 'Errore upload.');
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(doc: ApartmentDocument) {
    if (!window.confirm(`Eliminare "${doc.name}"?`)) return;
    setDeleting(doc.id);
    try {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      const { error } = await supabase.from('apartment_documents').delete().eq('id', doc.id);
      if (error) throw error;
      onDeleted(doc);
    } catch (err: any) {
      showNotice('error', err.message ?? 'Errore eliminazione.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownload(doc: ApartmentDocument) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 3600);
    if (error || !data?.signedUrl) { showNotice('error', 'Link non disponibile.'); return; }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) pickFile(f);
  }, []);

  const byYear = docs.reduce<Record<number, ApartmentDocument[]>>((acc, d) => {
    (acc[d.doc_year] ??= []).push(d); return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col h-full">
      {/* Colored header bar */}
      <div className={`${accent.bar} rounded-t-2xl px-4 py-3 flex items-center gap-2`}>
        <FolderOpen size={17} className="text-white opacity-90" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white leading-none">{apartment.name}</h2>
          <p className="text-xs text-white/70 mt-0.5">{docs.length} doc · {years.length} ann{years.length === 1 ? 'o' : 'i'}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-3 border border-t-0 border-slate-200 rounded-b-2xl p-4 bg-white">

        {/* Notice */}
        {notice && (
          <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs border animate-fade-in ${
            notice.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notice.type === 'success' ? <CheckCircle2 size={13} className="flex-shrink-0" /> : <AlertCircle size={13} className="flex-shrink-0" />}
            <span className="truncate">{notice.msg}</span>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`flex items-center justify-center gap-2 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            dragging ? `${accent.border} ${accent.light} ring-2 ${accent.ring}` : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input ref={inputRef} type="file" accept={ALLOWED_TYPES.join(',')} className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
          {uploading ? (
            <>
              <Loader2 size={16} className={`animate-spin ${accent.text}`} />
              <p className="text-xs text-slate-500 truncate max-w-[160px]">{progress}</p>
            </>
          ) : (
            <>
              <Upload size={16} className={dragging ? accent.text : 'text-slate-400'} />
              <p className="text-xs text-slate-500">
                Trascina o <span className={`${accent.text} font-semibold`}>scegli file</span>
              </p>
            </>
          )}
        </div>

        {/* Documents */}
        {docs.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">Nessun documento</p>
        ) : (
          <div className="space-y-2">
            {years.map((y) => (
              <YearSection
                key={y}
                year={y}
                docs={byYear[y].sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))}
                isOrange={isOrange}
                defaultOpen={y === CURRENT_YEAR}
                onDownload={handleDownload}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Carica documento</h3>
              <button onClick={() => setModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
              {fileIcon(modal.file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{modal.file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(modal.file.size)}</p>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Anno</label>
              <select value={docYear} onChange={(e) => setDocYear(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white">
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}{y === CURRENT_YEAR ? ' (corrente)' : ''}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nota (opzionale)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Es: Bolletta gas Gen 2026…" rows={2}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Annulla
              </button>
              <button onClick={() => doUpload(modal.file, description, docYear)}
                className={`flex-1 py-2 ${accent.btn} text-white text-sm font-semibold rounded-xl transition-colors`}>
                Carica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [docs, setDocs] = useState<ApartmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  async function load() {
    try {
      const [a, d] = await Promise.all([
        supabase.from('apartments').select('*').order('name'),
        supabase.from('apartment_documents').select('*').order('uploaded_at', { ascending: false }),
      ]);
      if (a.error) throw a.error;
      if (d.error) throw d.error;
      setApartments(a.data ?? []);
      setDocs(d.data ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Errore di caricamento');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 m-6">
      <AlertCircle size={20} /> {error}
    </div>
  );

  const totalDocs = docs.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-800 rounded-xl text-white">
          <FolderOpen size={18} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 leading-none">Documenti</h1>
          <p className="text-xs text-slate-500 mt-0.5">{totalDocs} document{totalDocs === 1 ? 'o' : 'i'} archiviati</p>
        </div>
      </div>

      {/* Desktop: side-by-side columns */}
      <div className="hidden md:grid md:grid-cols-2 gap-5">
        {apartments.map((apt) => (
          <ApartmentPanel
            key={apt.id}
            apartment={apt}
            docs={docs.filter((d) => d.apartment_id === apt.id)}
            onUploaded={load}
            onDeleted={(doc) => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
          />
        ))}
      </div>

      {/* Mobile: tabs */}
      <div className="md:hidden">
        <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-4">
          {apartments.map((apt, i) => {
            const isOrange = apt.color_theme === 'orange';
            const active = activeTab === i;
            return (
              <button
                key={apt.id}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? isOrange ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {apt.location}
              </button>
            );
          })}
        </div>
        {apartments[activeTab] && (
          <ApartmentPanel
            apartment={apartments[activeTab]}
            docs={docs.filter((d) => d.apartment_id === apartments[activeTab].id)}
            onUploaded={load}
            onDeleted={(doc) => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
          />
        )}
      </div>
    </div>
  );
}
