'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReceiptScanner from '@/components/ReceiptScanner';
import ItemEditor from '@/components/ItemEditor';
import { addPurchase, addConsumptionRecords } from '@/lib/db';
import type { OCRExtractedItem, PurchaseType } from '@/lib/types';

type ScanState = 'scanning' | 'editing' | 'saved';

export default function ScanPage() {
  const router = useRouter();
  const [state, setState] = useState<ScanState>('scanning');
  const [extractedItems, setExtractedItems] = useState<Array<OCRExtractedItem & { category: string }>>([]);
  const [store, setStore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [total, setTotal] = useState(0);
  const [receiptImage, setReceiptImage] = useState<string | undefined>();
  const [savedPurchaseId, setSavedPurchaseId] = useState<number | null>(null);

  const handleItemsExtracted = useCallback((
    items: Array<OCRExtractedItem & { category: string }>,
    extractedStore: string,
    extractedDate: string,
    extractedTotal: number,
    image?: string,
  ) => {
    setExtractedItems(items);
    setStore(extractedStore);
    setDate(extractedDate);
    setTotal(extractedTotal);
    setReceiptImage(image);
    setState('editing');
  }, []);

  const handleSave = useCallback(async (data: {
    items: Array<OCRExtractedItem & { category: string }>;
    store: string;
    date: string;
    totalAmount: number;
    type: PurchaseType;
    receiptImage?: string;
  }) => {
    try {
      const purchaseId = await addPurchase(
        {
          date: data.date,
          store: data.store,
          totalAmount: data.totalAmount,
          type: data.type,
          itemCount: data.items.length,
          receiptImage: data.receiptImage,
          createdAt: new Date().toISOString(),
        },
        data.items.map(item => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }))
      );

      // Add to consumption tracking
      const consumptionRecords = data.items.map(item => ({
        itemName: item.name,
        category: item.category,
        purchaseId,
        purchaseDate: data.date,
        quantity: item.quantity,
        unit: item.unit,
        status: 'active' as const,
      }));

      await addConsumptionRecords(consumptionRecords);

      setSavedPurchaseId(purchaseId);
      setState('saved');
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Erro ao salvar compra. Tente novamente.');
    }
  }, []);

  const handleCancel = useCallback(() => {
    setState('scanning');
    setExtractedItems([]);
    setStore('');
    setDate(new Date().toISOString().split('T')[0]);
    setTotal(0);
    setReceiptImage(undefined);
  }, []);

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => state === 'editing' ? handleCancel() : router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {state === 'scanning' && 'Escanear Comprovante'}
            {state === 'editing' && 'Revisar Itens'}
            {state === 'saved' && 'Compra Salva!'}
          </h1>
          <p className="text-xs text-gray-500">
            {state === 'scanning' && 'Tire uma foto do cupom fiscal'}
            {state === 'editing' && 'Confira e edite os itens extraídos'}
            {state === 'saved' && 'Sua compra foi registrada com sucesso'}
          </p>
        </div>
      </div>

      {/* Scanning State */}
      {state === 'scanning' && (
        <ReceiptScanner onItemsExtracted={handleItemsExtracted} />
      )}

      {/* Editing State */}
      {state === 'editing' && (
        <ItemEditor
          initialItems={extractedItems}
          initialStore={store}
          initialDate={date}
          initialTotal={total}
          receiptImage={receiptImage}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Saved State */}
      {state === 'saved' && (
        <div className="text-center py-12 space-y-6 animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Compra Registrada!</h2>
            <p className="text-sm text-gray-500">
              Todos os itens foram salvos e adicionados ao rastreamento de consumo.
            </p>
          </div>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={() => router.push(`/purchases/${savedPurchaseId}`)}
              className="py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition"
            >
              Ver Compra
            </button>
            <button
              onClick={handleCancel}
              className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition"
            >
              Escanear Outro Comprovante
            </button>
            <button
              onClick={() => router.push('/')}
              className="py-3 text-gray-500 hover:text-gray-700 text-sm transition"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
