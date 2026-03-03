'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, DollarSign, ShoppingBag, Award } from 'lucide-react';
import { getPurchasesByDateRange, getCategorySpending, getTopItems, getPurchases } from '@/lib/db';
import { getCategoryById } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), { ssr: false });
const CategoryChart = dynamic(() => import('@/components/CategoryChart'), { ssr: false });

type Period = '1m' | '3m' | '6m' | '1y';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('3m');
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [weeklyAvg, setWeeklyAvg] = useState(0);
  const [monthlyAvg, setMonthlyAvg] = useState(0);
  const [weeklyData, setWeeklyData] = useState<Array<{ label: string; total: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string; icon: string }>>([]);
  const [topItems, setTopItems] = useState<Array<{ name: string; totalSpent: number; count: number }>>([]);
  const [weeklyVsMonthly, setWeeklyVsMonthly] = useState({ weekly: 0, monthly: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const months = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[period];
        const start = new Date(now);
        start.setMonth(start.getMonth() - months);
        const startStr = start.toISOString().split('T')[0];
        const endStr = now.toISOString().split('T')[0];

        // Total spent
        const purchases = await getPurchasesByDateRange(startStr, endStr);
        const total = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        setTotalSpent(total);
        setPurchaseCount(purchases.length);

        // Weekly vs Monthly
        const weeklyTotal = purchases.filter(p => p.type === 'weekly').reduce((sum, p) => sum + p.totalAmount, 0);
        const monthlyTotal = purchases.filter(p => p.type === 'monthly').reduce((sum, p) => sum + p.totalAmount, 0);
        setWeeklyVsMonthly({ weekly: weeklyTotal, monthly: monthlyTotal });

        // Averages
        const weeks = months * 4.33;
        setWeeklyAvg(total / weeks);
        setMonthlyAvg(total / months);

        // Weekly trend
        const weekData: Array<{ label: string; total: number }> = [];
        const totalWeeks = Math.min(months * 4, 24);
        for (let i = totalWeeks - 1; i >= 0; i--) {
          const wStart = new Date(now);
          wStart.setDate(now.getDate() - (now.getDay() + 7 * i));
          const wEnd = new Date(wStart);
          wEnd.setDate(wStart.getDate() + 6);
          const wPurchases = await getPurchasesByDateRange(
            wStart.toISOString().split('T')[0],
            wEnd.toISOString().split('T')[0]
          );
          weekData.push({
            label: `${wStart.getDate()}/${wStart.getMonth() + 1}`,
            total: wPurchases.reduce((sum, p) => sum + p.totalAmount, 0),
          });
        }
        setWeeklyData(weekData);

        // Categories
        const catSpending = await getCategorySpending(startStr, endStr);
        const catData = Object.entries(catSpending)
          .map(([catId, value]) => {
            const cat = getCategoryById(catId);
            return { name: cat.name, value, color: cat.color, icon: cat.icon };
          })
          .sort((a, b) => b.value - a.value);
        setCategoryData(catData);

        // Top items
        const top = await getTopItems(startStr, endStr, 10);
        setTopItems(top);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  return (
    <div className="page-container space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Análise de Gastos</h1>
        <p className="text-xs text-gray-500">Entenda seus padrões de consumo</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { value: '1m', label: '1 mês' },
          { value: '3m', label: '3 meses' },
          { value: '6m', label: '6 meses' },
          { value: '1y', label: '1 ano' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value as Period)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
              period === value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-brand-500" />
                <span className="text-[10px] text-gray-500 uppercase">Total no período</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(totalSpent)}</p>
              <p className="text-[10px] text-gray-400">{purchaseCount} compras</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] text-gray-500 uppercase">Média mensal</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(monthlyAvg)}</p>
              <p className="text-[10px] text-gray-400">{formatCurrency(weeklyAvg)}/semana</p>
            </div>
          </div>

          {/* Weekly vs Monthly breakdown */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">🛒 Semanal vs Mensal</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Compras Semanais</span>
                  <span className="text-xs font-semibold text-brand-700">{formatCurrency(weeklyVsMonthly.weekly)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSpent > 0 ? (weeklyVsMonthly.weekly / totalSpent) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Compras Mensais</span>
                  <span className="text-xs font-semibold text-blue-700">{formatCurrency(weeklyVsMonthly.monthly)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalSpent > 0 ? (weeklyVsMonthly.monthly / totalSpent) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Spending Trend */}
          <SpendingChart data={weeklyData} title="📈 Tendência de Gastos Semanais" />

          {/* Category Breakdown */}
          <CategoryChart data={categoryData} title="📂 Distribuição por Categoria" />

          {/* Top Items */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              <Award className="w-4 h-4 inline mr-1 text-amber-500" />
              Top 10 - Mais Gastos
            </h3>
            {topItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sem dados</p>
            ) : (
              <div className="space-y-2">
                {topItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate capitalize">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.count}x comprado</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {formatCurrency(item.totalSpent)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
