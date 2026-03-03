'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, TrendingUp, TrendingDown, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { db, getPurchasesByDateRange, getActiveConsumption, getAverageDuration, getCategorySpending } from '@/lib/db';
import { getCategoryById } from '@/lib/categories';
import { formatCurrency, formatDate } from '@/lib/utils';
import PurchaseCard from '@/components/PurchaseCard';
import type { Purchase, ConsumptionRecord } from '@/lib/types';

const SpendingChart = dynamic(() => import('@/components/SpendingChart'), { ssr: false });
const CategoryChart = dynamic(() => import('@/components/CategoryChart'), { ssr: false });

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [monthTotal, setMonthTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthPurchases, setMonthPurchases] = useState(0);
  const [avgPerPurchase, setAvgPerPurchase] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);
  const [weeklyData, setWeeklyData] = useState<Array<{ label: string; total: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string; icon: string }>>([]);
  const [lowItems, setLowItems] = useState<Array<{ name: string; daysLeft: number; urgency: string }>>([]);

  const loadData = useCallback(async () => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Week start (Sunday)
      const weekDay = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - weekDay);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = now.toISOString().split('T')[0];

      // Get month purchases
      const purchases = await getPurchasesByDateRange(monthStart, monthEnd);
      const total = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
      setMonthTotal(total);
      setMonthPurchases(purchases.length);
      setAvgPerPurchase(purchases.length > 0 ? total / purchases.length : 0);

      // Get week total
      const weekPurchases = await getPurchasesByDateRange(weekStartStr, weekEndStr);
      setWeekTotal(weekPurchases.reduce((sum, p) => sum + p.totalAmount, 0));

      // Recent purchases (last 5)
      const allPurchases = await db.purchases.orderBy('date').reverse().limit(5).toArray();
      setRecentPurchases(allPurchases);

      // Weekly trend (last 8 weeks)
      const weeks: Array<{ label: string; total: number }> = [];
      for (let i = 7; i >= 0; i--) {
        const wStart = new Date(now);
        wStart.setDate(now.getDate() - (weekDay + 7 * i));
        const wEnd = new Date(wStart);
        wEnd.setDate(wStart.getDate() + 6);
        const wPurchases = await getPurchasesByDateRange(
          wStart.toISOString().split('T')[0],
          wEnd.toISOString().split('T')[0]
        );
        const wTotal = wPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const label = `${wStart.getDate()}/${wStart.getMonth() + 1}`;
        weeks.push({ label, total: wTotal });
      }
      setWeeklyData(weeks);

      // Category breakdown
      const catSpending = await getCategorySpending(monthStart, monthEnd);
      const catData = Object.entries(catSpending)
        .map(([catId, value]) => {
          const cat = getCategoryById(catId);
          return { name: cat.name, value, color: cat.color, icon: cat.icon };
        })
        .sort((a, b) => b.value - a.value);
      setCategoryData(catData);

      // Items running low
      const activeItems = await getActiveConsumption();
      const lowItemsList: Array<{ name: string; daysLeft: number; urgency: string }> = [];

      for (const item of activeItems) {
        const avgDays = await getAverageDuration(item.itemName);
        if (avgDays) {
          const daysSincePurchase = Math.ceil(
            (now.getTime() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          const daysLeft = avgDays - daysSincePurchase;
          let urgency = 'ok';
          if (daysLeft <= 0) urgency = 'critical';
          else if (daysLeft <= 3) urgency = 'warning';

          if (urgency !== 'ok') {
            lowItemsList.push({ name: item.itemName, daysLeft, urgency });
          }
        }
      }

      setLowItems(lowItemsList.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton w-40 h-7 mb-1" />
            <div className="skeleton w-24 h-4" />
          </div>
          <div className="skeleton w-10 h-10 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-56 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">MercadoApp</h1>
          <p className="text-xs text-gray-500">Gestão inteligente de compras</p>
        </div>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Este mês</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(monthTotal)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 opacity-80" />
            <span className="text-xs font-medium opacity-80">Esta semana</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(weekTotal)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Compras/mês</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{monthPurchases}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Média/compra</span>
          </div>
          <p className="text-lg font-bold text-gray-800">{formatCurrency(avgPerPurchase)}</p>
        </div>
      </div>

      {/* Items Running Low */}
      {lowItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800">Itens Acabando</h3>
          </div>
          <div className="space-y-2">
            {lowItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-amber-700">{item.name}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.urgency === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.daysLeft <= 0
                    ? 'Provavelmente acabou'
                    : `~${item.daysLeft} dias restantes`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Spending Trend */}
      <SpendingChart data={weeklyData} title="📊 Gastos Semanais (8 semanas)" />

      {/* Category Breakdown */}
      <CategoryChart data={categoryData} title="📂 Gastos por Categoria (Mês)" />

      {/* Recent Purchases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">🛒 Últimas Compras</h3>
          <Link href="/purchases" className="text-xs text-brand-600 font-medium hover:underline">
            Ver todas
          </Link>
        </div>
        {recentPurchases.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhuma compra registrada</p>
            <Link
              href="/scan"
              className="inline-block mt-3 text-sm text-brand-600 font-medium hover:underline"
            >
              Escanear primeiro comprovante →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPurchases.map(purchase => (
              <PurchaseCard key={purchase.id} purchase={purchase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
