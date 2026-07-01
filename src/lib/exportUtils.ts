import { Expense, Apartment, ExpenseCategory } from './types';
import { formatCurrency, formatDate } from './periodUtils';

interface ExportRow {
  Data: string;
  Scadenza: string;
  Categoria: string;
  Periodo: string;
  Importo: string;
  'Importo (num)': number;
  Stato: string;
  Descrizione: string;
}

function buildRows(expenses: Expense[], categories: ExpenseCategory[]): ExportRow[] {
  return expenses.map((e) => {
    const cat = categories.find((c) => c.id === e.category_id);
    return {
      Data: formatDate(e.expense_date),
      Scadenza: e.due_date ? formatDate(e.due_date) : '',
      Categoria: cat?.name ?? '',
      Periodo: e.period_label ?? '',
      Importo: formatCurrency(e.amount),
      'Importo (num)': Number(e.amount),
      Stato: e.status === 'paid' ? 'Pagata' : 'Da pagare',
      Descrizione: e.description ?? '',
    };
  });
}

function escapeCsv(val: string | number): string {
  const s = String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportToExcel(
  expenses: Expense[],
  categories: ExpenseCategory[],
  apartment: Apartment,
  year: number
): void {
  const rows = buildRows(expenses, categories);
  const headers = ['Data', 'Scadenza', 'Categoria', 'Periodo', 'Importo', 'Importo (num)', 'Stato', 'Descrizione'];
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const paid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);

  const lines: string[] = [];
  lines.push(`H2H - Home2Home — ${apartment.name} — Anno ${year}`);
  lines.push(`Totale: ${formatCurrency(total)}  |  Pagato: ${formatCurrency(paid)}  |  Da pagare: ${formatCurrency(total - paid)}`);
  lines.push('');
  lines.push(headers.map(escapeCsv).join(','));
  rows.forEach((r) => {
    lines.push(headers.map((h) => escapeCsv(r[h as keyof ExportRow])).join(','));
  });
  lines.push('');
  lines.push(`TOTALE,,,, ${formatCurrency(total)},${total},,`);

  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `h2h_${apartment.location.toLowerCase()}_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(
  expenses: Expense[],
  categories: ExpenseCategory[],
  apartment: Apartment,
  year: number
): void {
  const rows = buildRows(expenses, categories);
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const paid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);

  const accentColor = apartment.color_theme === 'orange' ? '#ea580c' : '#0891b2';

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>H2H — ${apartment.name} — ${year}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; background: #fff; padding: 24px; }
  h1 { font-size: 20px; font-weight: 900; color: #0f172a; }
  .subtitle { font-size: 13px; color: #64748b; margin-top: 2px; }
  .summary { display: flex; gap: 32px; margin: 16px 0; padding: 12px 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
  .summary-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }
  .summary-item p { font-size: 16px; font-weight: 800; }
  .total { color: #0f172a; }
  .paid { color: #16a34a; }
  .pending { color: #d97706; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
  thead th { background: ${accentColor}; color: #fff; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
  thead th.num { text-align: right; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
  tbody td.num { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
  .paid-badge { background: #dcfce7; color: #15803d; }
  .pending-badge { background: #fef3c7; color: #b45309; }
  tfoot td { padding: 8px 10px; font-weight: 900; background: #f1f5f9; border-top: 2px solid #cbd5e1; }
  tfoot td.num { text-align: right; }
  .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: right; }
  @media print { body { padding: 0; } @page { margin: 1.5cm; } }
</style>
</head>
<body>
<h1>H2H — Home2Home</h1>
<p class="subtitle">${apartment.name} &nbsp;|&nbsp; Anno ${year}</p>
<div class="summary">
  <div class="summary-item"><label>Totale</label><p class="total">${formatCurrency(total)}</p></div>
  <div class="summary-item"><label>Pagato</label><p class="paid">${formatCurrency(paid)}</p></div>
  <div class="summary-item"><label>Da pagare</label><p class="pending">${formatCurrency(total - paid)}</p></div>
  <div class="summary-item"><label>N. spese</label><p class="total">${expenses.length}</p></div>
</div>
<table>
  <thead><tr>
    <th>Data</th><th>Categoria</th><th>Periodo</th><th>Scadenza</th>
    <th class="num">Importo</th><th>Stato</th><th>Descrizione</th>
  </tr></thead>
  <tbody>
    ${rows.map((r) => `<tr>
      <td>${r.Data}</td>
      <td>${r.Categoria}</td>
      <td>${r.Periodo}</td>
      <td>${r.Scadenza}</td>
      <td class="num">${r.Importo}</td>
      <td><span class="badge ${r.Stato === 'Pagata' ? 'paid-badge' : 'pending-badge'}">${r.Stato}</span></td>
      <td>${r.Descrizione}</td>
    </tr>`).join('')}
  </tbody>
  <tfoot><tr>
    <td colspan="4"><strong>TOTALE</strong></td>
    <td class="num">${formatCurrency(total)}</td>
    <td colspan="2"></td>
  </tr></tfoot>
</table>
<p class="footer">Generato il ${new Date().toLocaleDateString('it-IT')} — H2H Home2Home</p>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function exportSummaryToExcel(
  expenses: Expense[],
  categories: ExpenseCategory[],
  apartment: Apartment
): void {
  const years = [...new Set(expenses.map((e) => e.year))].sort();
  const allLines: string[] = [];

  allLines.push(`H2H - Home2Home — ${apartment.name} — Storico completo`);
  allLines.push('');

  const headers = ['Anno', 'Data', 'Scadenza', 'Categoria', 'Periodo', 'Importo', 'Importo (num)', 'Stato', 'Descrizione'];

  allLines.push(headers.map(escapeCsv).join(','));

  years.forEach((year) => {
    const yearExpenses = expenses.filter((e) => e.year === year);
    const rows = buildRows(yearExpenses, categories);
    rows.forEach((r) => {
      const row = [year, r.Data, r.Scadenza, r.Categoria, r.Periodo, r.Importo, r['Importo (num)'], r.Stato, r.Descrizione];
      allLines.push(row.map(escapeCsv).join(','));
    });
    const yearTotal = yearExpenses.reduce((s, e) => s + Number(e.amount), 0);
    allLines.push(escapeCsv(`TOTALE ${year}`) + `,,,,${formatCurrency(yearTotal)},${yearTotal},,`);
    allLines.push('');
  });

  const bom = '\uFEFF';
  const blob = new Blob([bom + allLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `h2h_${apartment.location.toLowerCase()}_storico.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
