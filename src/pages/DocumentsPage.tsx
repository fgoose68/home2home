import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileText, FileImage, FileSpreadsheet, File, Download, Trash2,
  Upload, FolderOpen, AlertCircle, CheckCircle2, Loader2, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, ApartmentDocument } from '../lib/types';

const BUCKET = 'apartment-docs';
const MAX_MB = 50;
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

function fileIcon(mime: string) {
  if (mime === 'application/pdf') return <FileText size={18} className="text-red-500" />;
  if (mime.startsWith('image/')) return <FileImage size={18} className="text-blue-500" />;
  if (mime.includes('excel') || mime.includes('spreadsheet')) return <FileSpreadsheet size={18} className="text-green-600" />;
  if (mime.includes('word') || mime.includes('document')) return <FileText size={18} className="text-blue-700" />;
  return <File size={18} className="text-slate-400" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface ApartmentColumnProps {
  apartment: Apartment;
  docs: ApartmentDocument[];
  onUploaded: () => void;
  onDeleted: (doc: ApartmentDocument) => void;
}

function ApartmentColumn({ apartment, docs, onUploaded, onDeleted }: ApartmentColumnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [descModal, setDescModal] = useState<{ file: File } | null>(null);
  const [description, setDescription] = useState('');

  const isOrange = apartment.color_theme === 'orange';
  const accent = isOrange
    ? { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', ring: 'ring-orange-300' }
    : { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-300' };

  function showNotice(type: 'success' | 'error', msg: string) {
    setNotice({ type, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return `Tipo file non supportato: ${file.type || 'sconosciuto'}`;
    if (file.size > MAX_MB * 1024 * 1024) return `File troppo grande (max ${MAX_MB} MB)`;
    return null;
  }

  function pickFile(file: File) {
    const err = validateFile(file);
    if (err) { showNotice('error', err); return; }
    setDescription('');
    setDescModal({ file });
  }

  async function doUpload(file: File, desc: string) {
    setDescModal(null);
    setUploading(true);
    setProgress(`Caricamento ${file.name}…`);
    try {
      const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${apartment.id}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}_${safeName}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from('apartment_documents').insert({
        apartment_id: apartment.id,
        name: file.name,
        description: desc.trim() || null,
        storage_path: path,
        file_size: file.size,
        mime_type: file.type,
      });
      if (dbErr) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw dbErr;
      }

      showNotice('success', `"${file.name}" caricato con successo.`);
      onUploaded();
    } catch (err: any) {
      showNotice('error', err.message ?? 'Errore durante il caricamento.');
    } finally {
      setUploading(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(doc: ApartmentDocument) {
    if (!window.confirm(`Eliminare "${doc.name}"? L'operazione non e' reversibile.`)) return;
    setDeleting(doc.id);
    try {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      const { error } = await supabase.from('apartment_documents').delete().eq('id', doc.id);
      if (error) throw error;
      onDeleted(doc);
    } catch (err: any) {
      showNotice('error', err.message ?? 'Errore durante l\'eliminazione.');
    } finally {
      setDeleting(null);
    }
  }

  async function handleDownload(doc: ApartmentDocument) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 3600);
    if (error || !data?.signedUrl) {
      showNotice('error', 'Impossibile generare il link di download.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 ${accent.light} ${accent.border} border rounded-2xl`}>
        <div className={`p-2.5 ${accent.bg} rounded-xl text-white shadow-sm`}>
          <FolderOpen size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">{apartment.name}</h2>
          <p className="text-xs text-slate-500">{apartment.address ?? apartment.location} · {docs.length} document{docs.length === 1 ? 'o' : 'i'}</p>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div className={`flex items-start gap-2 p-3 rounded-xl text-sm border ${
          notice.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        } animate-fade-in`}>
          {notice.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
          {notice.msg}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          dragging ? `${accent.border} ${accent.light} ring-2 ${accent.ring}` : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
        />
        {uploading ? (
          <>
            <Loader2 size={28} className={`animate-spin ${accent.text}`} />
            <p className="text-sm text-slate-500">{progress}</p>
          </>
        ) : (
          <>
            <Upload size={28} className={dragging ? accent.text : 'text-slate-400'} />
            <p className="text-sm font-medium text-slate-600">Trascina qui o <span className={`${accent.text} font-semibold`}>clicca per selezionare</span></p>
            <p className="text-xs text-slate-400">PDF, immagini, Word, Excel · max {MAX_MB} MB</p>
          </>
        )}
      </div>

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Nessun documento caricato
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="mt-0.5 flex-shrink-0">{fileIcon(doc.mime_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                {doc.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{doc.description}</p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{formatSize(doc.file_size)} · {formatDate(doc.uploaded_at)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Scarica / Visualizza"
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deleting === doc.id}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  title="Elimina"
                >
                  {deleting === doc.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Description modal */}
      {descModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Aggiungi nota (opzionale)</h3>
              <button onClick={() => setDescModal(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl mb-4">
              <div className="flex-shrink-0">{fileIcon(descModal.file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{descModal.file.name}</p>
                <p className="text-xs text-slate-400">{formatSize(descModal.file.size)}</p>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Es: Bolletta gas Gennaio 2026, Contratto affitto…"
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setDescModal(null)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => doUpload(descModal.file, description)}
                className={`flex-1 py-2 ${accent.bg} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity`}
              >
                Carica
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [docs, setDocs] = useState<ApartmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <div className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 m-6">
      <AlertCircle size={20} /> {error}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-slate-800 rounded-xl text-white">
            <FolderOpen size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Documenti</h1>
        </div>
        <p className="text-sm text-slate-500 ml-14">
          Archivia contratti, bollette, planimetrie e qualsiasi documento per ogni appartamento.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {apartments.map((apt) => (
          <ApartmentColumn
            key={apt.id}
            apartment={apt}
            docs={docs.filter((d) => d.apartment_id === apt.id)}
            onUploaded={load}
            onDeleted={(doc) => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
          />
        ))}
      </div>
    </div>
  );
}
