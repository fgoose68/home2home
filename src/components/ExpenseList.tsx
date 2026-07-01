import { useState } from 'react';
import { Pencil, Trash2, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Expense, ExpenseCategory } from '../lib/types';
import { formatCurrency, formatDate } from '../lib/periodUtils';

interface ExpenseListProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, categories, onEdit, onDelete, onToggleStatus }: ExpenseListProps) {
  const [sortField, setSortField] = useState<'expense_date' | 'amount' | 'category'>('expense_date');
  const [sortAsc, setSortAsc] = useState(false);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm font-medium">Nessuna spesa trovata</p>
        <p className="text-xs mt-1">Premi "Aggiungi spesa" per iniziare</p>
      </div>
    );
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  }

  const sorted = [...expenses].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'expense_date') cmp = a.expense_date.localeCompare(b.expense_date);
    else if (sortField === 'amount') cmp = a.amount - b.amount;
    else {
      const ca = categories.find((c) => c.id === a.category_id)?.name ?? '';
      const cb = categories.find((c) => c.id === b.category_id)?.name ?? '';
      cmp = ca.localeCompare(cb);
    }
    return sortAsc ? cmp : -cmp;
  });

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <ChevronDown size={12} className="opacity-30" />;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const paid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      {/* Totals bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
        <span className="text-slate-500">Totale: <strong className="text-slate-800">{formatCurrency(total)}</strong></span>
        <span className="text-green-600">Pagato: <strong>{formatCurrency(paid)}</strong></span>
        <span className="text-amber-600">Da pagare: <strong>{formatCurrency(total - paid)}</strong></span>
        <span className="text-slate-400 ml-auto">{expenses.length} spese</span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700"
                onClick={() => toggleSort('expense_date')}
              >
                <span className="flex items-center gap-1">Data <SortIcon field="expense_date" /></span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700"
                onClick={() => toggleSort('category')}
              >
                <span className="flex items-center gap-1">Categoria <SortIcon field="category" /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Periodo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Scadenza</th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700"
                onClick={() => toggleSort('amount')}
              >
                <span className="flex items-center justify-end gap-1">Importo <SortIcon field="amount" /></span>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Stato</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Note</th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((expense) => {
              const cat = categories.find((c) => c.id === expense.category_id);
              return (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-4 py-3 text-slate-600">{formatDate(expense.expense_date)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color ?? '#94a3b8' }} />
                      <span className="font-medium text-slate-700">{cat?.name ?? '-'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{expense.period_label ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{expense.due_date ? formatDate(expense.due_date) : '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">
                    {formatCurrency(Number(expense.amount))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onToggleStatus(expense)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        expense.status === 'paid'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {expense.status === 'paid' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {expense.status === 'paid' ? 'Pagata' : 'Da pagare'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate">{expense.description ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                        title="Modifica"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sorted.map((expense) => {
          const cat = categories.find((c) => c.id === expense.category_id);
          return (
            <div key={expense.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat?.color ?? '#94a3b8' }} />
                  {cat?.name ?? '-'}
                </span>
                <span className="text-lg font-bold text-slate-800 tabular-nums">{formatCurrency(Number(expense.amount))}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span>{formatDate(expense.expense_date)}</span>
                {expense.period_label && <span className="bg-slate-100 px-2 py-0.5 rounded">{expense.period_label}</span>}
                {expense.due_date && <span>Scad. {formatDate(expense.due_date)}</span>}
              </div>
              {expense.description && <p className="text-xs text-slate-400 mb-3">{expense.description}</p>}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onToggleStatus(expense)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    expense.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {expense.status === 'paid' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {expense.status === 'paid' ? 'Pagata' : 'Da pagare'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(expense)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(expense.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
