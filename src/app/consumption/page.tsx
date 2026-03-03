'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, CheckCircle, Clock, Trash2, AlertTriangle, ChevronDown, Calendar } from 'lucide-react';
import {
  getActiveConsumption,
  getAllConsumption,
  markItemFinished,
  markItemWasted,
  getAverageDuration,
} from '@/lib/db';
import { getCategoryById } from '@/lib/categories';
import { formatDate, todayISO } from '@/lib/utils';
import type { ConsumptionRecord } from '@/lib/types';

interface ConsumptionWithMeta extends ConsumptionRecord {
  avgDuration: number | null;
  daysSincePurchase: number;
  percentUsed: number;
  urgency: 'ok' | 'warning' | 'critical';
}

export default function ConsumptionPage() {
  const [tab, setTab] = useState<'active' | 'finished'>('active');
  const [loading, setLoading] = useState(true);
  const [activeItems, setActiveItems] = useState<ConsumptionWithMeta[]>([]);
  const [finishedItems, setFinishedItems] = useState<ConsumptionRecord[]>([]);
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [finishDate, setFinishDate] = useState(todayISO());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();

      // Active items
      const active = await getActiveConsumption();
      const withMeta: ConsumptionWithMeta[] = await Promise.all(
        active.map(async (item) => {
          const avgDuration = await getAverageDuration(item.itemName);
          const daysSincePurchase = Math.ceil(
            (now.getTime() - new Date(item.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          let percentUsed = 0;
          let urgency: 'ok' | 'warning' | 'critical' = 'ok';

          if (avgDuration) {
            percentUsed = Math.min(100, Math.round((daysSincePurchase / avgDuration) * 100));
            if (percentUsed >= 100) urgency = 'critical';
            else if (percentUsed >= 75) urgency = 'warning';
          }

          return {
            ...item,
            avgDuration,
            daysSincePurchase,
            percentUsed,
            urgency,
          };
        })
      );

      // Sort: critical first, then warning, then ok
      withMeta.sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      });

      setActiveItems(withMeta);

      // Finished items
      const all = await getAllConsumption();
      setFinishedItems(all.filter(r => r.status !== 'active'));
    } catch (error) {
      console.error('Error loading consumption:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFinish = async (id: number) => {
    await markItemFinished(id, finishDate);
    setExpandedItem(null);
    loadData();
  };

  const handleWaste = async (id: number) => {
    await markItemWasted(id);
    setExpandedItem(null);
    loadData();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-brand-500';
    }
  };

  const getUrgencyBg = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      default: return 'bg-white border-gray-100';
    }
  };

  return (
    <div className="page-container space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Consumo</h1>
        <p className="text-xs text-gray-500">Acompanhe a duração dos seus itens</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition ${
            tab === 'active' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1" />
          Em uso ({activeItems.length})
        </button>
        <button
          onClick={() => setTab('finished')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition ${
            tab === 'finished' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Finalizados ({finishedItems.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : tab === 'active' ? (
        /* Active Items */
        activeItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Nenhum item em uso</p>
            <p className="text-xs text-gray-400 mt-1">
              Escaneie um comprovante para começar a rastrear
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeItems.map((item) => {
              const cat = getCategoryById(item.category);
              const isExpanded = expandedItem === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border shadow-sm overflow-hidden transition ${getUrgencyBg(item.urgency)}`}
                >
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpandedItem(isExpanded ? null : item.id!)}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.itemName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400">
                          Comprado: {formatDate(item.purchaseDate)}
                        </span>
                        {item.avgDuration && (
                          <span className="text-[10px] text-gray-400">
                            · Dura ~{item.avgDuration}d
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      {item.avgDuration && (
                        <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getUrgencyColor(item.urgency)}`}
                            style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.urgency === 'critical' && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs font-medium text-gray-500">
                        {item.daysSincePurchase}d
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-100/50">
                      <div className="flex items-center gap-2 pt-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <label className="text-xs text-gray-600">Data que acabou:</label>
                        <input
                          type="date"
                          value={finishDate}
                          onChange={(e) => setFinishDate(e.target.value)}
                          max={todayISO()}
                          className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFinish(item.id!)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Acabou
                        </button>
                        <button
                          onClick={() => handleWaste(item.id!)}
                          className="flex items-center justify-center gap-1.5 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Desperdiçou
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Finished Items */
        finishedItems.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Nenhum item finalizado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {finishedItems.map((item) => {
              const cat = getCategoryById(item.category);
              return (
                <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.itemName}</p>
                      <p className="text-[10px] text-gray-400">
                        {formatDate(item.purchaseDate)}
                        {item.finishedDate && ` → ${formatDate(item.finishedDate)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.durationDays && (
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          {item.durationDays}d
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.status === 'finished'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.status === 'finished' ? 'Usado' : 'Desperdiçado'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
