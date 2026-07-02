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
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item) => {
          const pct = (item.value / max) * 100;
          return (
            <div key={item.color + item.label} className="flex flex-col items-center flex-1 min-w-0 group" style={{ height }}>
              <div className="relative w-full flex flex-col items-center justify-end flex-1">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 ease-out cursor-default"
                  style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: item.color, opacity: 0.85 }}
                  title={`${item.label.replace('\n', ' ')}: ${formatCurrency(item.value)}`}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
                  {formatCurrency(item.value)}
                </div>
              </div>
              <div className="h-8 flex items-start justify-center pt-0.5 w-full">
                <span className="text-xs text-slate-500 text-center whitespace-pre-wrap leading-tight">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
