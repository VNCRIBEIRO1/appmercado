# 🛒 MercadoApp - Gestão Inteligente de Compras

PWA para controle de gastos de mercado com leitura OCR de comprovantes fiscais.

## ✨ Funcionalidades

### 📸 Escaneamento OCR
- Tire foto ou faça upload do comprovante fiscal
- Extração automática com IA (ExtractLab API)
- Identificação de itens, quantidades, preços
- Revisão e edição antes de salvar

### 📊 Dashboard
- Total gasto no mês e na semana
- Número de compras e média por compra
- Gráfico de tendência semanal
- Distribuição por categorias
- Itens acabando (previsão inteligente)

### 🛒 Gestão de Compras
- Histórico completo de compras
- Filtro por tipo (semanal/mensal)
- Busca por mercado
- Detalhes com itens agrupados por categoria
- Visualização do comprovante original

### 📈 Análise de Gastos
- Períodos: 1 mês, 3 meses, 6 meses, 1 ano
- Gastos semanais vs mensais
- Top 10 itens mais comprados
- Distribuição por categoria

### 📦 Rastreamento de Consumo
- Acompanhe quanto tempo cada item dura
- Previsão de quando vai acabar
- Alertas de itens acabando
- Histórico de duração por item

### ⚙️ Configurações
- Configuração da API ExtractLab
- Backup e restauração (JSON)
- Exportação de dados

## 🚀 Setup

### Pré-requisitos
- Node.js 18+
- Conta na [ExtractLab](https://extractlab.com.br) (gratuita)

### Instalação

```bash
# Clonar repositório
git clone https://github.com/VNCRIBEIRO1/appmercado.git
cd appmercado

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com seu token da ExtractLab

# Rodar em desenvolvimento
npm run dev
```

### Configuração ExtractLab

1. Crie uma conta em [extractlab.com.br](https://extractlab.com.br)
2. Vá em Configurações → Tokens de Acesso
3. Crie um novo token
4. Configure um modelo "Nota Fiscal" na sua conta
5. Adicione o token no app (Configurações) ou no `.env.local`

## 🏗️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilos utilitários
- **Dexie.js** - IndexedDB para armazenamento local
- **Recharts** - Gráficos interativos
- **ExtractLab API** - OCR de documentos fiscais
- **PWA** - Instalável como app nativo

## 📁 Estrutura

```
src/
├── app/
│   ├── api/ocr/        # Rota API proxy para ExtractLab
│   ├── analytics/       # Página de análises
│   ├── consumption/     # Rastreamento de consumo
│   ├── purchases/       # Histórico de compras
│   ├── scan/            # Escaneamento OCR
│   ├── settings/        # Configurações
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Dashboard
├── components/          # Componentes reutilizáveis
├── lib/                 # Utilities e lógica de negócio
│   ├── db.ts            # IndexedDB (Dexie)
│   ├── types.ts         # TypeScript types
│   ├── categories.ts    # Categorias de produtos
│   ├── receipt-parser.ts # Parser de cupons fiscais
│   └── utils.ts         # Funções utilitárias
└── public/
    └── manifest.json    # PWA manifest
```

## 🌐 Deploy

O app é automaticamente deployado no Vercel a cada push na branch `main`.

**URL:** Configurada no [Vercel Dashboard](https://vercel.com)

## 📱 Categorias de Produtos

| Categoria | Ícone |
|-----------|-------|
| Frutas e Verduras | 🥬 |
| Carnes e Frios | 🥩 |
| Laticínios | 🧀 |
| Padaria | 🍞 |
| Bebidas | 🥤 |
| Limpeza | 🧹 |
| Higiene | 🧴 |
| Mercearia / Secos | 🫘 |
| Congelados | 🧊 |
| Temperos e Molhos | 🌶️ |
| Grãos e Cereais | 🌾 |
| Snacks e Doces | 🍫 |
| Pet | 🐾 |
| Outros | 📦 |

## 📄 Licença

Uso pessoal.
