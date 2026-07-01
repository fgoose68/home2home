import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../lib/periodUtils';

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  color?: string;
  icon: React.ReactNode;
}

export default function SummaryCard({ title, value, subtitle, trend, color = 'slate', icon }: SummaryCardProps) {
  const colorMap: Record<string, string> = {
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    red: 'bg-red-50 border-red-100 text-red-600',
    slate: 'bg-slate-50 border-slate-100 text-slate-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className={`p-2 rounded-xl border ${colorMap[color] ?? colorMap.slate}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800 tabular-nums">
        {formatCurrency(value)}
      </p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          trend > 0 ? 'text-red-500' : trend < 0 ? 'text-green-500' : 'text-slate-400'
        }`}>
          {trend > 0 ? <TrendingUp size={13} /> : trend < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
          {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs anno precedente
        </div>
      )}
    </div>
  );
}
