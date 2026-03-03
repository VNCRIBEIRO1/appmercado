'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Key, FileText, Download, Upload, Trash2,
  Save, AlertCircle, CheckCircle, Database, Info,
  BookOpen, ChevronDown, ChevronUp, ExternalLink, Copy,
} from 'lucide-react';
import { exportAllData, importData, db } from '@/lib/db';

export default function SettingsPage() {
  const router = useRouter();
  const [apiToken, setApiToken] = useState('');
  const [modelName, setModelName] = useState('Cupom Mercado');
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [stats, setStats] = useState({ purchases: 0, items: 0, consumption: 0 });

  useEffect(() => {
    // Load settings from localStorage
    const token = localStorage.getItem('extractlab_token') || '';
    const model = localStorage.getItem('extractlab_model') || 'Cupom Mercado';
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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 1500);
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

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 space-y-1">
              <p className="font-semibold">⚠️ Importante: Modelo de IA precisa ser treinado!</p>
              <p>A ExtractLab exige que você crie e treine um modelo antes de usar o OCR. Clique em &quot;Guia de Setup&quot; abaixo para instruções detalhadas.</p>
            </div>
          </div>
        </div>

        {/* Setup Guide Toggle */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            📘 Guia de Setup Completo
          </div>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showGuide && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4 text-xs text-gray-700">
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-2">🔧 Passo a Passo - Configurar ExtractLab</h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-semibold">Criar Conta</p>
                    <p className="text-gray-500">Acesse <a href="https://extractlab.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">extractlab.com.br</a> e crie sua conta gratuita (100 docs/dia grátis).</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-semibold">Gerar Token de Acesso</p>
                    <p className="text-gray-500">Vá em Configurações → Tokens de Acesso → Criar novo token (marque &quot;Nunca Expira&quot;). Cole o token abaixo.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-semibold">Criar Modelo de IA</p>
                    <p className="text-gray-500">No painel, vá em &quot;Criar Modelo&quot;. Use o nome <strong>&quot;Cupom Mercado&quot;</strong> (ou outro de sua escolha - anote o nome exato!).</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">4</span>
                  <div>
                    <p className="font-semibold">Definir Campos para Extração</p>
                    <p className="text-gray-500">Na criação do modelo, defina os campos que o OCR vai extrair. Clique em &quot;Ver campos recomendados&quot; abaixo para os nomes exatos.</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">5</span>
                  <div>
                    <p className="font-semibold">Treinar com Documentos</p>
                    <p className="text-gray-500">Faça upload de 5 a 20 cupons fiscais de mercado (fotos ou PDFs). Quanto mais variados, melhor será a leitura.</p>
                    <div className="mt-1 bg-white rounded-lg p-2 border">
                      <p className="font-semibold text-gray-700">💡 Dicas de treinamento:</p>
                      <ul className="list-disc ml-4 text-gray-500 space-y-0.5 mt-1">
                        <li>Use cupons de mercados diferentes</li>
                        <li>Inclua fotos claras e bem iluminadas</li>
                        <li>Varie entre PDFs e fotos tiradas com celular</li>
                        <li>Marque os campos corretamente em cada documento</li>
                        <li>Mínimo 5 docs, ideal 10-20 para boa precisão</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">6</span>
                  <div>
                    <p className="font-semibold">Configurar no App</p>
                    <p className="text-gray-500">Depois de treinar, cole o token e o nome exato do modelo nos campos abaixo e salve.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <a
                href="https://extractlab.com.br/Model/Create"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-xs transition"
              >
                <ExternalLink className="w-3 h-3" />
                Abrir ExtractLab - Criar Modelo
              </a>
            </div>
          </div>
        )}

        {/* Recommended Fields */}
        <button
          onClick={() => setShowFields(!showFields)}
          className="w-full flex items-center justify-between py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-medium transition"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            📋 Campos Recomendados para o Modelo
          </div>
          {showFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFields && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
            <p className="text-xs text-purple-700">
              Use estes nomes exatos ao criar os campos do modelo na ExtractLab. Clique para copiar:
            </p>
            
            {[
              { name: 'estabelecimento', desc: 'Nome/razão social da loja', type: 'Texto' },
              { name: 'data_emissao', desc: 'Data do cupom (DD/MM/AAAA)', type: 'Data' },
              { name: 'total_nota', desc: 'Valor total da compra', type: 'Número' },
              { name: 'itens', desc: 'Bloco completo com todos os itens', type: 'Texto Longo' },
              { name: 'cnpj', desc: 'CNPJ do estabelecimento', type: 'Texto' },
            ].map((field) => (
              <button
                key={field.name}
                onClick={() => copyToClipboard(field.name, field.name)}
                className="w-full flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition text-left"
              >
                <div>
                  <code className="text-xs font-mono font-bold text-purple-800">{field.name}</code>
                  <p className="text-[10px] text-gray-500">{field.desc} ({field.type})</p>
                </div>
                {copiedField === field.name ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ))}

            <div className="bg-white rounded-lg p-3 border border-purple-100 mt-2">
              <p className="text-[10px] text-purple-600 font-semibold mb-1">💡 Campo &quot;itens&quot; - Importante!</p>
              <p className="text-[10px] text-gray-500">
                No treinamento, selecione o bloco inteiro da lista de produtos do cupom (incluindo nomes, quantidades e preços).
                O app vai interpretar automaticamente cada linha.
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
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
              placeholder="Cupom Mercado"
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              ⚠️ Use o nome EXATO do modelo criado na sua conta ExtractLab (sensível a maiúsculas/minúsculas)
            </p>
          </div>
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
