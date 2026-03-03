'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import type { OCRExtractedItem } from '@/lib/types';
import { parseOCRResponse, categorizeItems } from '@/lib/receipt-parser';
import { compressImage, fileToBase64 } from '@/lib/utils';

interface ReceiptScannerProps {
  onItemsExtracted: (items: Array<OCRExtractedItem & { category: string }>, store: string, date: string, total: number, image?: string) => void;
}

export default function ReceiptScanner({ onItemsExtracted }: ReceiptScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Compress image
      const compressed = await compressImage(file, 2, 2048);
      const base64 = await fileToBase64(compressed);
      setPreview(base64);

      // Get settings from localStorage
      const apiToken = localStorage.getItem('extractlab_token') || '';
      const modelName = localStorage.getItem('extractlab_model') || 'Nota Fiscal';

      // Send to API route
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('modelName', modelName);
      if (apiToken) {
        formData.append('apiToken', apiToken);
      }

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      const parsed = parseOCRResponse(data);
      const categorized = categorizeItems(parsed.items);

      onItemsExtracted(categorized, parsed.store, parsed.date, parsed.totalAmount, base64);
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRetry = () => {
    setError(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!isProcessing && !error && !preview && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-brand-50 hover:bg-brand-100 rounded-2xl border-2 border-dashed border-brand-300 transition-colors"
          >
            <Camera className="w-12 h-12 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">Tirar Foto</span>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-blue-50 hover:bg-blue-100 rounded-2xl border-2 border-dashed border-blue-300 transition-colors"
          >
            <Upload className="w-12 h-12 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Escolher Arquivo</span>
          </button>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          {preview && (
            <div className="w-32 h-32 rounded-xl overflow-hidden opacity-60">
              <img src={preview} alt="Comprovante" className="w-full h-full object-cover" />
            </div>
          )}
          <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Processando comprovante...</p>
            <p className="text-xs text-gray-500 mt-1">Lendo itens com OCR inteligente</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Erro ao processar</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
            <button
              onClick={() => {
                setError(null);
                setPreview(null);
                onItemsExtracted([], '', new Date().toISOString().split('T')[0], 0);
              }}
              className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Adicionar manualmente
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-gray-400">
        📸 Tire uma foto clara do cupom fiscal ou nota de compra
      </p>
    </div>
  );
}
