'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Calendar, MapPin, ShoppingBag, Tag, Receipt } from 'lucide-react';
import { getPurchaseById, getPurchaseItems, deletePurchase } from '@/lib/db';
import { formatCurrency, formatDateLong, getUnitAbbr } from '@/lib/utils';
import { getCategoryById } from '@/lib/categories';
import type { Purchase, PurchaseItem } from '@/lib/types';

export default function PurchaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = Number(params.id);

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImage, setShowImage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getPurchaseById(purchaseId);
        if (!p) {
          router.replace('/purchases');
          return;
        }
        setPurchase(p);

        const i = await getPurchaseItems(purchaseId);
        setItems(i);
      } catch (error) {
        console.error('Error loading purchase:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [purchaseId, router]);

  const handleDelete = async () => {
    try {
      await deletePurchase(purchaseId);
      router.replace('/purchases');
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PurchaseItem[]>);

  if (loading) {
    return (
      <div className="page-container space-y-4">
        <div className="skeleton h-10 w-32 rounded-lg" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!purchase) return null;

  return (
    <div className="page-container space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Detalhes</h1>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Purchase Info Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              purchase.type === 'weekly' ? 'bg-brand-100' : 'bg-blue-100'
            }`}>
              <ShoppingBag className={`w-6 h-6 ${
                purchase.type === 'weekly' ? 'text-brand-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{purchase.store}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                purchase.type === 'weekly'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {purchase.type === 'weekly' ? 'Compra Semanal' : 'Compra Mensal'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase">Data</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{formatDateLong(purchase.date)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase">Itens</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{purchase.itemCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase">Total</p>
            <p className="text-sm font-bold text-brand-700 mt-0.5">{formatCurrency(purchase.totalAmount)}</p>
          </div>
        </div>

        {/* Receipt Image Button */}
        {purchase.receiptImage && (
          <button
            onClick={() => setShowImage(!showImage)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-600 transition"
          >
            <Receipt className="w-4 h-4" />
            {showImage ? 'Ocultar Comprovante' : 'Ver Comprovante'}
          </button>
        )}
      </div>

      {/* Receipt Image */}
      {showImage && purchase.receiptImage && (
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <img
            src={purchase.receiptImage}
            alt="Comprovante"
            className="w-full rounded-xl"
          />
        </div>
      )}

      {/* Items by Category */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Itens da Compra</h3>

        {Object.entries(groupedItems).map(([catId, catItems]) => {
          const cat = getCategoryById(catId);
          const catTotal = catItems.reduce((sum, i) => sum + i.totalPrice, 0);

          return (
            <div key={catId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                <span className="text-xs font-medium text-gray-600">
                  {cat.icon} {cat.name}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {formatCurrency(catTotal)}
                </span>
              </div>

              {/* Category Items */}
              <div className="divide-y divide-gray-50">
                {catItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {item.quantity} {getUnitAbbr(item.unit)} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700 ml-3">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900">Excluir Compra?</h3>
            <p className="text-sm text-gray-600">
              Esta ação não pode ser desfeita. Todos os itens e dados de consumo desta compra serão removidos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
