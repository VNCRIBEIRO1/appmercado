'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Key, FileText, Download, Upload, Trash2,
  Save, AlertCircle, CheckCircle, Database, Info,
} from 'lucide-react';
import { exportAllData, importData, db } from '@/lib/db';

export default function SettingsPage() {
  const router = useRouter();
  const [apiToken, setApiToken] = useState('');
  const [modelName, setModelName] = useState('Nota Fiscal');
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [stats, setStats] = useState({ purchases: 0, items: 0, consumption: 0 });

  useEffect(() => {
    // Load settings from localStorage
    const token = localStorage.getItem('extractlab_token') || '';
    const model = localStorage.getItem('extractlab_model') || 'Nota Fiscal';
    setApiToken(token);
    setModelName(model);

    // Load stats
    const loadStats = async () => {
      const purchases = await db.purchases.count();
      const items = await db.purchaseItems.count();
      const consumption = await db.consumption.count();
      setStats({ purchases, items, consumption });
    };
    loadStats();
  }, []);

  const handleSave = () => {
    localStorage.setItem('extractlab_token', apiToken);
    localStorage.setItem('extractlab_model', modelName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mercadoapp-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      setImportError('');
      window.location.reload();
    } catch (error) {
      setImportError('Arquivo inválido. Use um backup exportado pelo app.');
    }

    e.target.value = '';
  };

  const handleClearAll = async () => {
    try {
      await db.purchases.clear();
      await db.purchaseItems.clear();
      await db.consumption.clear();
      setShowClearConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error('Clear error:', error);
    }
  };

  return (
    <div className="page-container space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Configurações</h1>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-800">API ExtractLab (OCR)</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-1">
              <p>Para usar o OCR, você precisa de uma conta na <a href="https://extractlab.com.br" target="_blank" rel="noopener noreferrer" className="font-semibold underline">ExtractLab</a>.</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Crie uma conta gratuita (100 docs/dia grátis)</li>
                <li>Acesse Configurações → Tokens de Acesso</li>
                <li>Crie um novo token e cole abaixo</li>
                <li>Configure um modelo &quot;Nota Fiscal&quot; na sua conta</li>
              </ol>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Token da API</label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="doc_seu_token_aqui..."
            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Modelo</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Nota Fiscal"
            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Nome exato do modelo configurado na sua conta ExtractLab
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>

      {/* Data Stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-800">Dados Armazenados</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">{stats.purchases}</p>
            <p className="text-[10px] text-gray-500">Compras</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">{stats.items}</p>
            <p className="text-[10px] text-gray-500">Itens</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">{stats.consumption}</p>
            <p className="text-[10px] text-gray-500">Consumo</p>
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-800">Backup e Restauração</h2>
        </div>

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium text-sm transition"
        >
          <Download className="w-4 h-4" />
          Exportar Backup (JSON)
        </button>

        <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-sm cursor-pointer transition">
          <Upload className="w-4 h-4" />
          Importar Backup
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {importError && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {importError}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 space-y-3">
        <h2 className="text-sm font-semibold text-red-700">⚠️ Zona de Perigo</h2>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition"
        >
          <Trash2 className="w-4 h-4" />
          Apagar Todos os Dados
        </button>
      </div>

      {/* Version */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">MercadoApp v1.0.0</p>
        <p className="text-[10px] text-gray-300">OCR by ExtractLab • Dados salvos localmente</p>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900">Apagar Todos os Dados?</h3>
            <p className="text-sm text-gray-600">
              Esta ação é irreversível. Todas as compras, itens e dados de consumo serão permanentemente excluídos.
              Faça um backup antes, se necessário.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition"
              >
                Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
