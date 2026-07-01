import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { ExpenseCategory } from '../lib/types';
import { AVAILABLE_YEARS } from '../lib/periodUtils';

export interface FilterState {
  year: number | null;
  categoryId: string;
  status: 'all' | 'pending' | 'paid';
  search: string;
}

interface FilterPanelProps {
  filters: FilterState;
  categories: ExpenseCategory[];
  onChange: (f: FilterState) => void;
}

export default function FilterPanel({ filters, categories, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    filters.year !== null,
    filters.categoryId !== '',
    filters.status !== 'all',
    filters.search !== '',
  ].filter(Boolean).length;

  function reset() {
    onChange({ year: null, categoryId: '', status: 'all', search: '' });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
          open || activeCount > 0
            ? 'bg-slate-800 border-slate-800 text-white'
            : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
        }`}
      >
        <Filter size={15} />
        Filtri
        {activeCount > 0 && (
          <span className="bg-amber-400 text-slate-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-4 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Filtri attivi</span>
            {activeCount > 0 && (
              <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <X size={12} /> Reset
              </button>
            )}
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Cerca</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Descrizione o periodo..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Anno</label>
            <select
              value={filters.year ?? ''}
              onChange={(e) => onChange({ ...filters, year: e.target.value ? Number(e.target.value) : null })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            >
              <option value="">Tutti gli anni</option>
              {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Categoria</label>
            <select
              value={filters.categoryId}
              onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
            >
              <option value="">Tutte le categorie</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Stato</label>
            <div className="flex gap-2">
              {([['all', 'Tutte'], ['pending', 'Da pagare'], ['paid', 'Pagate']] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => onChange({ ...filters, status: v })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filters.status === v
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Applica
          </button>
        </div>
      )}
    </div>
  );
}
