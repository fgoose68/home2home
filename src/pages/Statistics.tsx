import { useEffect, useState, useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, AlertCircle, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Apartment, Expense, ExpenseCategory } from '../lib/types';
import BarChart from '../components/BarChart';
import { formatCurrency, AVAILABLE_YEARS } from '../lib/periodUtils';
import { exportToExcel, exportToPDF, exportSummaryToExcel } from '../lib/exportUtils';

export default function Statistics() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>('all');

  useEffect(() => {
    async function load() {
      try {
        const [a, c, e] = await Promise.all([
          supabase.from('apartments').select('*').order('name'),
          supabase.from('expense_categories').select('*').order('sort_order'),
          supabase.from('expenses').select('*').order('expense_date'),
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

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const yearMatch = e.year === selectedYear;
      const aptMatch = selectedApartmentId === 'all' || e.apartment_id === selectedApartmentId;
      return yearMatch && aptMatch;
    });
  }, [expenses, selectedYear, selectedApartmentId]);

  const filteredCats = useMemo(() => {
    if (selectedApartmentId === 'all') return categories;
    return categories.filter((c) => c.apartment_id === selectedApartmentId);
  }, [categories, selectedApartmentId]);

  // Totals by category for selected year/apt
  const catData = useMemo(() => filteredCats.map((cat) => ({
    label: cat.name,
    value: filtered.filter((e) => e.category_id === cat.id).reduce((s, e) => s + Number(e.amount), 0),
    color: cat.color,
  })).filter((d) => d.value > 0), [filtered, filteredCats]);

  // Year-over-year totals per apartment
  const yearlyData = useMemo(() => AVAILABLE_YEARS.map((y) => ({
    year: y,
    roma: expenses
      .filter((e) => e.year === y && apartments.find((a) => a.id === e.apartment_id && a.location === 'Roma'))
      .reduce((s, e) => s + Number(e.amount), 0),
    nettuno: expenses
      .filter((e) => e.year === y && apartments.find((a) => a.id === e.apartment_id && a.location === 'Nettuno'))
      .reduce((s, e) => s + Number(e.amount), 0),
  })), [expenses, apartments]);

  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const paidFiltered = filtered.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);

  function handleExportExcel() {
    const apt = selectedApartmentId === 'all'
      ? { id: 'all', name: 'Tutti gli appartamenti', location: 'All', address: null, color_theme: 'slate', icon: null, created_at: '' }
      : apartments.find((a) => a.id === selectedApartmentId)!;
    if (!apt) return;
    exportToExcel(filtered, categories, apt as Apartment, selectedYear);
  }

  function handleExportPDF() {
    const apt = selectedApartmentId === 'all'
      ? { id: 'all', name: 'Tutti gli appartamenti', location: 'All', address: null, color_theme: 'slate', icon: null, created_at: '' }
      : apartments.find((a) => a.id === selectedApartmentId)!;
    if (!apt) return;
    exportToPDF(filtered, categories, apt as Apartment, selectedYear);
  }

  function handleExportFullExcel() {
    apartments.forEach((apt) => {
      const aptExpenses = expenses.filter((e) => e.apartment_id === apt.id);
      const aptCats = categories.filter((c) => c.apartment_id === apt.id);
      exportSummaryToExcel(aptExpenses, aptCats, apt);
    });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 size={24} className="text-slate-600" /> Statistiche spese
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Analisi annuale 2024–2030</p>
        </div>

        {/* Export buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <FileText size={15} /> PDF
          </button>
          <button
            onClick={handleExportFullExcel}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={15} /> Storico completo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Anno</label>
          <div className="flex gap-1.5 flex-wrap">
            {AVAILABLE_YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedYear === y
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div className="w-px bg-slate-200 self-stretch hidden sm:block" />
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Appartamento</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedApartmentId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                selectedApartmentId === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Entrambi
            </button>
            {apartments.map((apt) => (
              <button
                key={apt.id}
                onClick={() => setSelectedApartmentId(apt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedApartmentId === apt.id
                    ? apt.color_theme === 'orange'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-blue-500 text-white border-blue-500'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {apt.location}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Totale spese', value: totalFiltered, color: 'text-slate-800', sub: `${filtered.length} voci` },
          { label: 'Pagato', value: paidFiltered, color: 'text-green-600', sub: `${filtered.filter((e) => e.status === 'paid').length} spese` },
          { label: 'Da pagare', value: totalFiltered - paidFiltered, color: 'text-amber-600', sub: `${filtered.filter((e) => e.status === 'pending').length} spese` },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-black tabular-nums ${color}`}>{formatCurrency(value)}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {catData.length > 0 ? (
          <BarChart
            title={`Spese per categoria — ${selectedYear}`}
            data={catData.map((d) => ({ ...d, label: d.label.length > 12 ? d.label.split(' ')[0] : d.label }))}
            height={200}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 flex items-center justify-center text-slate-400 text-sm">
            Nessuna spesa nel {selectedYear}
          </div>
        )}

        {/* Year-over-year comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Confronto annuale (tutti gli anni)</h3>
          <div className="space-y-3">
            {yearlyData.map(({ year, roma, nettuno }) => {
              const total = roma + nettuno;
              const maxTotal = Math.max(...yearlyData.map((d) => d.roma + d.nettuno), 1);
              return (
                <div key={year} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${year === selectedYear ? 'text-slate-800' : 'text-slate-500'}`}>{year}</span>
                    <span className="tabular-nums font-medium text-slate-700">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-100">
                    {roma > 0 && (
                      <div
                        className="bg-orange-400 transition-all duration-500"
                        style={{ width: `${(roma / maxTotal) * 100}%` }}
                        title={`Roma: ${formatCurrency(roma)}`}
                      />
                    )}
                    {nettuno > 0 && (
                      <div
                        className="bg-blue-400 transition-all duration-500"
                        style={{ width: `${(nettuno / maxTotal) * 100}%` }}
                        title={`Nettuno: ${formatCurrency(nettuno)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-orange-400" /> Roma</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-400" /> Nettuno</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed breakdown table */}
      {catData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Dettaglio per categoria — {selectedYear}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Categoria</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Appartamento</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Totale</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Pagato</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Da pagare</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">N. spese</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 w-40">% totale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {catData.sort((a, b) => b.value - a.value).map((item) => {
                  const cat = filteredCats.find((c) => c.name === item.label || c.color === item.color);
                  const apt = apartments.find((a) => a.id === cat?.apartment_id);
                  const catExpenses = filtered.filter((e) => e.category_id === cat?.id);
                  const paid = catExpenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
                  const pct = totalFiltered > 0 ? (item.value / totalFiltered) * 100 : 0;
                  return (
                    <tr key={item.label} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-slate-700">{cat?.name ?? item.label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          apt?.color_theme === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {apt?.location ?? '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800 tabular-nums">{formatCurrency(item.value)}</td>
                      <td className="px-5 py-3 text-right text-green-600 tabular-nums">{formatCurrency(paid)}</td>
                      <td className="px-5 py-3 text-right text-amber-600 tabular-nums">{formatCurrency(item.value - paid)}</td>
                      <td className="px-5 py-3 text-center text-slate-500">{catExpenses.length}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td className="px-5 py-3 font-bold text-slate-800" colSpan={2}>Totale</td>
                  <td className="px-5 py-3 text-right font-black text-slate-800 tabular-nums">{formatCurrency(totalFiltered)}</td>
                  <td className="px-5 py-3 text-right font-bold text-green-600 tabular-nums">{formatCurrency(paidFiltered)}</td>
                  <td className="px-5 py-3 text-right font-bold text-amber-600 tabular-nums">{formatCurrency(totalFiltered - paidFiltered)}</td>
                  <td className="px-5 py-3 text-center font-bold text-slate-600">{filtered.length}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-medium">Nessuna spesa registrata</p>
          <p className="text-xs mt-1">Inizia aggiungendo spese dagli appartamenti</p>
        </div>
      )}
    </div>
  );
}
