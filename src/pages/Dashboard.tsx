import { useEffect, useState } from 'react';
import { Building2, Home, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, Expense, ExpenseCategory } from '../lib/types';
import SummaryCard from '../components/SummaryCard';
import BarChart from '../components/BarChart';
import { formatCurrency } from '../lib/periodUtils';
import { ActivePage } from '../lib/types';

interface DashboardProps {
  onNavigate: (page: ActivePage) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [a, c, e] = await Promise.all([
          supabase.from('apartments').select('*').order('name'),
          supabase.from('expense_categories').select('*').order('sort_order'),
          supabase.from('expenses').select('*').eq('year', CURRENT_YEAR),
        ]);
        if (a.error) throw a.error;
        if (c.error) throw c.error;
        if (e.error) throw e.error;
        setApartments(a.data ?? []);
        setCategories(c.data ?? []);
        setExpenses(e.data ?? []);
      } catch (err: any) {
        setError(err.message ?? 'Errore di caricamento');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 m-6">
      <AlertCircle size={20} />
      {error}
    </div>
  );

  const roma = apartments.find((a) => a.location === 'Roma');
  const nettuno = apartments.find((a) => a.location === 'Nettuno');

  const romaExpenses = expenses.filter((e) => e.apartment_id === roma?.id);
  const nettunoExpenses = expenses.filter((e) => e.apartment_id === nettuno?.id);

  const totalRoma = romaExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalNettuno = nettunoExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalAll = totalRoma + totalNettuno;
  const totalPaid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);

  // Bar chart: totals by category with apartment disambiguation
  const nameCount = categories.reduce<Record<string, number>>((acc, c) => {
    acc[c.name] = (acc[c.name] ?? 0) + 1;
    return acc;
  }, {});
  const catTotals = categories.map((cat) => {
    const apt = apartments.find((a) => a.id === cat.apartment_id);
    const isDuplicate = (nameCount[cat.name] ?? 0) > 1;
    const label = isDuplicate && apt ? `${cat.name}\n${apt.location}` : cat.name;
    return {
      label,
      value: expenses.filter((e) => e.category_id === cat.id).reduce((s, e) => s + Number(e.amount), 0),
      color: cat.color,
    };
  }).filter((d) => d.value > 0);

  // Recent expenses
  const recent = [...expenses]
    .sort((a, b) => b.expense_date.localeCompare(a.expense_date))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-slate-400 text-sm font-medium mb-1">Anno corrente {CURRENT_YEAR}</p>
          <h1 className="text-3xl font-black mb-1">Riepilogo spese</h1>
          <p className="text-slate-300 text-sm">Gestione appartamenti Roma e Nettuno</p>
          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Totale {CURRENT_YEAR}</p>
              <p className="text-3xl font-black tabular-nums">{formatCurrency(totalAll)}</p>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Pagato</p>
              <p className="text-2xl font-bold text-green-400 tabular-nums">{formatCurrency(totalPaid)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">Da pagare</p>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Roma — Totale"
          value={totalRoma}
          subtitle={`${romaExpenses.length} spese registrate`}
          icon={<Building2 size={18} />}
          color="orange"
        />
        <SummaryCard
          title="Nettuno — Totale"
          value={totalNettuno}
          subtitle={`${nettunoExpenses.length} spese registrate`}
          icon={<Home size={18} />}
          color="blue"
        />
        <SummaryCard
          title="Spese pagate"
          value={totalPaid}
          subtitle={`${expenses.filter((e) => e.status === 'paid').length} fatture`}
          icon={<CheckCircle2 size={18} />}
          color="green"
        />
        <SummaryCard
          title="Da pagare"
          value={totalPending}
          subtitle={`${expenses.filter((e) => e.status === 'pending').length} fatture`}
          icon={<Clock size={18} />}
          color="amber"
        />
      </div>

      {/* Apartments quick access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roma card */}
        <button
          onClick={() => onNavigate('roma')}
          className="group text-left bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-xl text-white shadow-sm">
              <Building2 size={22} />
            </div>
            <TrendingUp size={16} className="text-orange-300 group-hover:text-orange-500 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">Appartamento Roma</h3>
          <p className="text-sm text-slate-500 mb-4">Condominio, TARI, Gas, Luce, Acqua, Cedolare</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-orange-600 tabular-nums">{formatCurrency(totalRoma)}</span>
            <span className="text-xs text-slate-400 bg-white rounded-full px-3 py-1 border border-orange-100">
              {romaExpenses.length} spese nel {CURRENT_YEAR}
            </span>
          </div>
        </button>

        {/* Nettuno card */}
        <button
          onClick={() => onNavigate('nettuno')}
          className="group text-left bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-xl text-white shadow-sm">
              <Home size={22} />
            </div>
            <TrendingUp size={16} className="text-blue-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">Appartamento Nettuno</h3>
          <p className="text-sm text-slate-500 mb-4">Condominio, Energia, TARI, IMU, Spese extra</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-blue-600 tabular-nums">{formatCurrency(totalNettuno)}</span>
            <span className="text-xs text-slate-400 bg-white rounded-full px-3 py-1 border border-blue-100">
              {nettunoExpenses.length} spese nel {CURRENT_YEAR}
            </span>
          </div>
        </button>
      </div>

      {/* Charts row */}
      {catTotals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            title={`Spese per categoria — ${CURRENT_YEAR}`}
            data={catTotals}
            height={180}
          />

          {/* Category breakdown table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Dettaglio per categoria</h3>
            <div className="space-y-2">
              {catTotals.sort((a, b) => b.value - a.value).map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="flex-1 text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800 tabular-nums">{formatCurrency(item.value)}</span>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(item.value / totalAll) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent expenses */}
      {recent.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Ultime spese registrate</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.map((expense) => {
              const cat = categories.find((c) => c.id === expense.category_id);
              const apt = apartments.find((a) => a.id === expense.apartment_id);
              return (
                <div key={expense.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.color ?? '#94a3b8' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700">{cat?.name ?? '-'}</p>
                    <p className="text-xs text-slate-400">{apt?.location} · {expense.period_label ?? expense.expense_date}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-800 tabular-nums">{formatCurrency(Number(expense.amount))}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    expense.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {expense.status === 'paid' ? 'Pagata' : 'Da pagare'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
