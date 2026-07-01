import { useEffect, useState, useMemo } from 'react';
import { Plus, AlertCircle, Building2, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, Expense, ExpenseCategory } from '../lib/types';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import FilterPanel, { FilterState } from '../components/FilterPanel';
import { AVAILABLE_YEARS } from '../lib/periodUtils';

interface ApartmentPageProps {
  location: 'Roma' | 'Nettuno';
}

const LOCATION_STYLE = {
  Roma: {
    gradient: 'from-orange-500 to-amber-500',
    light: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    icon: <Building2 size={22} />,
  },
  Nettuno: {
    gradient: 'from-blue-500 to-cyan-500',
    light: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Home size={22} />,
  },
};

export default function ApartmentPage({ location }: ApartmentPageProps) {
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    year: new Date().getFullYear(),
    categoryId: '',
    status: 'all',
    search: '',
  });

  const style = LOCATION_STYLE[location];

  useEffect(() => {
    setLoading(true);
    setError('');
    async function load() {
      try {
        const { data: apts, error: ae } = await supabase
          .from('apartments')
          .select('*')
          .eq('location', location)
          .maybeSingle();
        if (ae) throw ae;
        if (!apts) throw new Error(`Appartamento ${location} non trovato`);
        setApartment(apts);

        const { data: cats, error: ce } = await supabase
          .from('expense_categories')
          .select('*')
          .eq('apartment_id', apts.id)
          .order('sort_order');
        if (ce) throw ce;
        setCategories(cats ?? []);

        const { data: exps, error: ee } = await supabase
          .from('expenses')
          .select('*')
          .eq('apartment_id', apts.id)
          .order('expense_date', { ascending: false });
        if (ee) throw ee;
        setExpenses(exps ?? []);
      } catch (err: any) {
        setError(err.message ?? 'Errore di caricamento');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.year !== null && e.year !== filters.year) return false;
      if (filters.categoryId && e.category_id !== filters.categoryId) return false;
      if (filters.status !== 'all' && e.status !== filters.status) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const cat = categories.find((c) => c.id === e.category_id);
        const matches =
          (e.description?.toLowerCase().includes(q) ?? false) ||
          (e.period_label?.toLowerCase().includes(q) ?? false) ||
          (cat?.name.toLowerCase().includes(q) ?? false);
        if (!matches) return false;
      }
      return true;
    });
  }, [expenses, filters, categories]);

  async function handleSave(data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    if (editingExpense) {
      const { error } = await supabase
        .from('expenses')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', editingExpense.id);
      if (error) throw error;
      setExpenses((prev) => prev.map((e) => e.id === editingExpense.id ? { ...e, ...data } : e));
    } else {
      const { data: inserted, error } = await supabase
        .from('expenses')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      setExpenses((prev) => [inserted, ...prev]);
    }
    setEditingExpense(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questa spesa?')) return;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleToggleStatus(expense: Expense) {
    const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
    const { error } = await supabase
      .from('expenses')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', expense.id);
    if (error) { alert(error.message); return; }
    setExpenses((prev) => prev.map((e) => e.id === expense.id ? { ...e, status: newStatus } : e));
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 m-6">
      <AlertCircle size={20} />{error}
    </div>
  );

  const totalYear = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const paidYear = filteredExpenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-br ${style.light} border ${style.border} rounded-2xl p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`p-3 bg-gradient-to-br ${style.gradient} rounded-xl text-white shadow-sm self-start`}>
            {style.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-800">{apartment?.name}</h1>
            <p className="text-sm text-slate-500">{apartment?.address}</p>
          </div>
          <button
            onClick={() => { setEditingExpense(null); setShowForm(true); }}
            className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${style.gradient} text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all text-sm self-start sm:self-auto`}
          >
            <Plus size={16} /> Aggiungi spesa
          </button>
        </div>

        {/* Totals */}
        <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-white/60">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              {filters.year ? `Totale ${filters.year}` : 'Totale filtrato'}
            </p>
            <p className={`text-2xl font-black ${style.text} tabular-nums`}>
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totalYear)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Pagato</p>
            <p className="text-xl font-bold text-green-600 tabular-nums">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(paidYear)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Da pagare</p>
            <p className="text-xl font-bold text-amber-600 tabular-nums">
              {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(totalYear - paidYear)}
            </p>
          </div>
        </div>
      </div>

      {/* Categories quick info */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {categories.map((cat) => {
          const total = filteredExpenses
            .filter((e) => e.category_id === cat.id)
            .reduce((s, e) => s + Number(e.amount), 0);
          return (
            <button
              key={cat.id}
              onClick={() => setFilters((f) => ({ ...f, categoryId: f.categoryId === cat.id ? '' : cat.id }))}
              className={`text-left p-3 rounded-xl border transition-all ${
                filters.categoryId === cat.id
                  ? 'border-2 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              style={filters.categoryId === cat.id ? { borderColor: cat.color, backgroundColor: cat.color + '15' } : {}}
            >
              <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: cat.color }} />
              <p className="text-xs font-semibold text-slate-700 truncate">{cat.name}</p>
              <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                {total > 0 ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(total) : '—'}
              </p>
            </button>
          );
        })}
      </div>

      {/* Year tabs + filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5 flex-1">
          <button
            onClick={() => setFilters((f) => ({ ...f, year: null }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filters.year === null
                ? 'bg-slate-800 text-white border-slate-800'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tutti
          </button>
          {AVAILABLE_YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setFilters((f) => ({ ...f, year: y }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filters.year === y
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <FilterPanel filters={filters} categories={categories} onChange={setFilters} />
      </div>

      {/* Expense list */}
      <ExpenseList
        expenses={filteredExpenses}
        categories={categories}
        onEdit={(e) => { setEditingExpense(e); setShowForm(true); }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Form modal */}
      {showForm && apartment && (
        <ExpenseForm
          categories={categories}
          apartmentId={apartment.id}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingExpense(null); }}
          initial={editingExpense}
        />
      )}
    </div>
  );
}
