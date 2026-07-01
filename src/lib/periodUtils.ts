import { BillingType } from './types';

interface PeriodInfo {
  label: string;
  suggestedDueDate: (year: number, index: number) => string;
}

const ITALIAN_MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  monthly: 'Mensile (12/anno)',
  bimonthly: 'Bimestrale (6/anno)',
  four_monthly: 'Quadrimestrale (3/anno)',
  quarterly: 'Trimestrale (4/anno)',
  quarterly_march: 'Trimestrale da marzo (4/anno)',
  tari_roma: 'TARI Roma - 3 rate quadrimestrali',
  tari_nettuno: 'TARI Nettuno - unica o trimestrale',
  biannual: 'Semestrale (2/anno)',
  annual: 'Annuale (1/anno)',
  free: 'Libero',
};

export function getPeriods(billingType: BillingType, year: number): PeriodInfo[] {
  switch (billingType) {
    case 'monthly':
      return ITALIAN_MONTHS.map((m, i) => ({
        label: `${m} ${year}`,
        suggestedDueDate: () => isoDate(year, i + 1, 28),
      }));

    case 'bimonthly':
      return [
        ['Gen', 'Feb'], ['Mar', 'Apr'], ['Mag', 'Giu'],
        ['Lug', 'Ago'], ['Set', 'Ott'], ['Nov', 'Dic'],
      ].map(([a, b], i) => ({
        label: `${a}-${b} ${year}`,
        suggestedDueDate: () => isoDate(year, (i + 1) * 2, 28),
      }));

    case 'four_monthly':
    case 'tari_roma':
      return [
        { label: `Gen-Apr ${year}`, due: isoDate(year, 4, 30) },
        { label: `Mag-Ago ${year}`, due: isoDate(year, 8, 31) },
        { label: `Set-Dic ${year}`, due: isoDate(year, 12, 10) },
      ].map(({ label, due }) => ({
        label,
        suggestedDueDate: () => due,
      }));

    case 'quarterly':
      return [
        { label: `Gen-Mar ${year}`, due: isoDate(year, 3, 31) },
        { label: `Apr-Giu ${year}`, due: isoDate(year, 6, 30) },
        { label: `Lug-Set ${year}`, due: isoDate(year, 9, 30) },
        { label: `Ott-Dic ${year}`, due: isoDate(year, 12, 31) },
      ].map(({ label, due }) => ({
        label,
        suggestedDueDate: () => due,
      }));

    case 'quarterly_march':
      return [
        { label: `Mar-Mag ${year}`, due: isoDate(year, 3, 31) },
        { label: `Giu-Ago ${year}`, due: isoDate(year, 6, 30) },
        { label: `Set-Nov ${year}`, due: isoDate(year, 9, 30) },
        { label: `Dic ${year}-Feb ${year + 1}`, due: isoDate(year, 12, 31) },
      ].map(({ label, due }) => ({
        label,
        suggestedDueDate: () => due,
      }));

    case 'tari_nettuno':
      return [
        { label: `Unica rata ${year}`, due: isoDate(year, 6, 30) },
        { label: `1ª rata ${year} (Gen-Mar)`, due: isoDate(year, 1, 31) },
        { label: `2ª rata ${year} (Apr-Giu)`, due: isoDate(year, 4, 30) },
        { label: `3ª rata ${year} (Lug-Set)`, due: isoDate(year, 7, 31) },
        { label: `4ª rata ${year} (Ott-Dic)`, due: isoDate(year, 10, 31) },
      ].map(({ label, due }) => ({
        label,
        suggestedDueDate: () => due,
      }));

    case 'biannual':
      return [
        { label: `Acconto Giu ${year}`, due: isoDate(year, 6, 16) },
        { label: `Saldo Dic ${year}`, due: isoDate(year, 12, 16) },
      ].map(({ label, due }) => ({
        label,
        suggestedDueDate: () => due,
      }));

    case 'annual':
      return [{
        label: `Anno ${year}`,
        suggestedDueDate: () => isoDate(year, 6, 30),
      }];

    case 'free':
    default:
      return [];
  }
}

export const AVAILABLE_YEARS: number[] = Array.from({ length: 7 }, (_, i) => 2024 + i);

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
