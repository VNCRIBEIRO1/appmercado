'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface CategoryChartProps {
  data: Array<{ name: string; value: number; color: string; icon?: string }>;
  title?: string;
}

export default function CategoryChart({ data, title }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
        <div className="h-40 flex items-center justify-center text-sm text-gray-400">
          Sem dados para exibir
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5 max-h-32 overflow-y-auto">
          {data.slice(0, 6).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-gray-600 truncate flex-1">
                {item.icon} {item.name}
              </span>
              <span className="text-[11px] font-medium text-gray-700 flex-shrink-0">
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
          {data.length > 6 && (
            <p className="text-[10px] text-gray-400">+{data.length - 6} categorias</p>
          )}
        </div>
      </div>
    </div>
  );
}
