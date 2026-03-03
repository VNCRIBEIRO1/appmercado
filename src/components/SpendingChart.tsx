'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface SpendingChartProps {
  data: Array<{ label: string; total: number }>;
  title?: string;
}

export default function SpendingChart({ data, title }: SpendingChartProps) {
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

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Total']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
