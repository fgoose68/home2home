import { formatCurrency } from '../lib/periodUtils';

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  height?: number;
}

export default function BarChart({ data, title, height = 160 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-2.5" style={{ maxHeight: height * 3, overflowY: 'auto' }}>
        {data.map((item) => {
          const pct = (item.value / max) * 100;
          return (
            <div key={item.color + item.label} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600 truncate pr-2">{item.label}</span>
                <span className="text-xs font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
