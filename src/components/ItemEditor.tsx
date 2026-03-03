'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, ChevronDown, GripVertical } from 'lucide-react';
import type { OCRExtractedItem, ItemUnit, PurchaseType } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { formatCurrency, getUnitAbbr } from '@/lib/utils';

interface EditableItem extends OCRExtractedItem {
  category: string;
  tempId: string;
}

interface ItemEditorProps {
  initialItems: Array<OCRExtractedItem & { category: string }>;
  initialStore: string;
  initialDate: string;
  initialTotal: number;
  receiptImage?: string;
  onSave: (data: {
    items: Array<OCRExtractedItem & { category: string }>;
    store: string;
    date: string;
    totalAmount: number;
    type: PurchaseType;
    receiptImage?: string;
  }) => void;
  onCancel: () => void;
}

const UNITS: { value: ItemUnit; label: string }[] = [
  { value: 'un', label: 'Un' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'pct', label: 'Pct' },
  { value: 'cx', label: 'Cx' },
  { value: 'dz', label: 'Dz' },
];

export default function ItemEditor({
  initialItems,
  initialStore,
  initialDate,
  initialTotal,
  receiptImage,
  onSave,
  onCancel,
}: ItemEditorProps) {
  const [items, setItems] = useState<EditableItem[]>(
    initialItems.map((item, i) => ({ ...item, tempId: `item-${i}-${Date.now()}` }))
  );
  const [store, setStore] = useState(initialStore);
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<PurchaseType>('weekly');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [addToConsumption, setAddToConsumption] = useState(true);

  const calculatedTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const displayTotal = initialTotal > 0 ? initialTotal : calculatedTotal;

  const addItem = () => {
    const newItem: EditableItem = {
      name: '',
      quantity: 1,
      unit: 'un',
      unitPrice: 0,
      totalPrice: 0,
      confidence: 1,
      category: 'outros',
      tempId: `item-new-${Date.now()}`,
    };
    setItems([...items, newItem]);
    setExpandedItem(newItem.tempId);
  };

  const removeItem = (tempId: string) => {
    setItems(items.filter(i => i.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.tempId !== tempId) return item;
      const updated = { ...item, [field]: value };
      // Auto-calculate totalPrice
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = Number((updated.quantity * updated.unitPrice).toFixed(2));
      }
      return updated;
    }));
  };

  const handleSave = () => {
    const validItems = items.filter(i => i.name.trim().length > 0);
    if (validItems.length === 0) return;

    onSave({
      items: validItems,
      store: store || 'Mercado',
      date,
      totalAmount: displayTotal,
      type,
      receiptImage,
    });
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estabelecimento</label>
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="Nome do mercado"
            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</label>
            <div className="flex mt-1 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
              <button
                onClick={() => setType('weekly')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition ${
                  type === 'weekly' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setType('monthly')}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition ${
                  type === 'monthly' ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Mensal
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-600">Total da compra</span>
          <span className="text-lg font-bold text-brand-700">{formatCurrency(displayTotal)}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            Itens ({items.length})
          </h3>
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">Nenhum item encontrado</p>
            <button
              onClick={addItem}
              className="mt-2 text-sm text-brand-600 font-medium hover:underline"
            >
              Adicionar item manualmente
            </button>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.tempId}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Collapsed View */}
            <div
              className="flex items-center gap-2 p-3 cursor-pointer"
              onClick={() => setExpandedItem(expandedItem === item.tempId ? null : item.tempId)}
            >
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="text-lg flex-shrink-0">
                {CATEGORIES.find(c => c.id === item.category)?.icon || '📦'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.name || 'Item sem nome'}
                </p>
                <p className="text-xs text-gray-500">
                  {item.quantity} {getUnitAbbr(item.unit)} × {formatCurrency(item.unitPrice)}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                {formatCurrency(item.totalPrice)}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                  expandedItem === item.tempId ? 'rotate-180' : ''
                }`}
              />
            </div>

            {/* Expanded Edit View */}
            {expandedItem === item.tempId && (
              <div className="px-3 pb-3 pt-0 space-y-2 border-t border-gray-50">
                <div>
                  <label className="text-[10px] font-medium text-gray-400 uppercase">Nome do Produto</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.tempId, 'name', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Nome do produto"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase">Qtd</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.tempId, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      step="0.001"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase">Unidade</label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.tempId, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {UNITS.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase">Preço un.</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.tempId, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-gray-400 uppercase">Categoria</label>
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(item.tempId, 'category', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">
                    Total: <span className="font-semibold text-gray-700">{formatCurrency(item.totalPrice)}</span>
                  </span>
                  <button
                    onClick={() => removeItem(item.tempId)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Consumption Toggle */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={addToConsumption}
            onChange={(e) => setAddToConsumption(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <p className="text-sm font-medium text-gray-700">Adicionar ao rastreamento de consumo</p>
            <p className="text-xs text-gray-500">Acompanhe quanto tempo cada item dura</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={items.filter(i => i.name.trim()).length === 0}
          className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
        >
          <Check className="w-5 h-5" />
          Salvar Compra
        </button>
      </div>
    </div>
  );
}
