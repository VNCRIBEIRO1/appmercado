'use client';

import Link from 'next/link';
import { ChevronRight, ShoppingBag, Calendar } from 'lucide-react';
import type { Purchase } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PurchaseCardProps {
  purchase: Purchase;
}

export default function PurchaseCard({ purchase }: PurchaseCardProps) {
  return (
    <Link href={`/purchases/${purchase.id}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            purchase.type === 'weekly'
              ? 'bg-brand-100 text-brand-600'
              : 'bg-blue-100 text-blue-600'
          }`}>
            <ShoppingBag className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {purchase.store || 'Mercado'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(purchase.date)}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                purchase.type === 'weekly'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {purchase.type === 'weekly' ? 'Semanal' : 'Mensal'}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-bold text-gray-800">{formatCurrency(purchase.totalAmount)}</p>
            <p className="text-[10px] text-gray-400">{purchase.itemCount} itens</p>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}
