import { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { ExpenseCategory, Expense } from '../lib/types';
import { getPeriods, AVAILABLE_YEARS } from '../lib/periodUtils';

interface ExpenseFormProps {
  categories: ExpenseCategory[];
  apartmentId: string;
  onSave: (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
  initial?: Expense | null;
}

const today = () => new Date().toISOString().split('T')[0];

export default function ExpenseForm({ categories, apartmentId, onSave, onClose, initial }: ExpenseFormProps) {
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [periodLabel, setPeriodLabel] = useState(initial?.period_label ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [expenseDate, setExpenseDate] = useState(initial?.expense_date ?? today());
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '');
  const [status, setStatus] = useState<'pending' | 'paid'>(initial?.status ?? 'pending');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedCat = categories.find((c) => c.id === categoryId);
  const periods = selectedCat ? getPeriods(selectedCat.billing_type, year) : [];

  // Reset period when category or year changes
  useEffect(() => {
    if (!initial) setPeriodLabel('');
  }, [categoryId, year]);

  // Auto-fill due date from period suggestion
  useEffect(() => {
    if (periods.length > 0 && periodLabel) {
      const p = periods.find((p) => p.label === periodLabel);
      if (p && !dueDate) setDueDate(p.suggestedDueDate(year, 0));
    }
  }, [periodLabel]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) { setError('Seleziona una categoria.'); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) { setError('Inserisci un importo valido.'); return; }
    setError('');
    setSaving(true);
    try {
      await onSave({
        apartment_id: apartmentId,
        category_id: categoryId,
        amount: Number(Number(amount).toFixed(2)),
        description: description || null,
        expense_date: expenseDate,
        due_date: dueDate || null,
        year,
        period_label: periodLabel || null,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {initial ? 'Modifica spesa' : 'Nuova spesa'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo di spesa *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
              required
            >
              <option value="">— seleziona —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {selectedCat?.notes && (
              <p className="text-xs text-slate-400 mt-1">{selectedCat.notes}</p>
            )}
          </div>

          {/* Year + Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Anno *</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
              >
                {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Periodo</label>
              {periods.length > 0 ? (
                <select
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                >
                  <option value="">— seleziona —</option>
                  {periods.map((p) => (
                    <option key={p.label} value={p.label}>{p.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={periodLabel}
                  onChange={(e) => setPeriodLabel(e.target.value)}
                  placeholder="es. Mag 2025"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Importo (€) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar size={14} className="inline mr-1" />Data spesa *
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar size={14} className="inline mr-1" />Scadenza
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Stato</label>
            <div className="flex gap-3">
              {(['pending', 'paid'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    status === s
                      ? s === 'paid'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-amber-500 border-amber-500 text-white'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s === 'paid' ? '✓ Pagata' : '⏳ Da pagare'}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Note / Descrizione</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descrizione opzionale..."
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-slate-800 rounded-xl text-sm font-medium text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
