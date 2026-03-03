'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { getPurchases } from '@/lib/db';
import PurchaseCard from '@/components/PurchaseCard';
import type { Purchase, PurchaseType } from '@/lib/types';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | PurchaseType>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPurchases();
        setPurchases(data);
      } catch (error) {
        console.error('Error loading purchases:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = purchases.filter(p => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (search && !p.store.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalFiltered = filtered.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <div className="page-container space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Compras</h1>
        <p className="text-xs text-gray-500">Histórico de todas as suas compras</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por mercado..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Todas' },
          { value: 'weekly', label: '🗓️ Semanais' },
          { value: 'monthly', label: '📅 Mensais' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value as typeof filter)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition ${
              filter === value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {filtered.length} compra{filtered.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-bold text-brand-700">
            Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFiltered)}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      )}

      {/* Purchase List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map(purchase => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-500 mb-1">
            {search || filter !== 'all' ? 'Nenhuma compra encontrada' : 'Nenhuma compra registrada ainda'}
          </p>
          <p className="text-xs text-gray-400">
            {search || filter !== 'all'
              ? 'Tente alterar os filtros'
              : 'Escaneie um comprovante para começar'}
          </p>
        </div>
      )}
    </div>
  );
}
