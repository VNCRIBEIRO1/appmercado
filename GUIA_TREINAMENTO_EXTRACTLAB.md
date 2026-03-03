# 📘 Guia de Treinamento - ExtractLab para Cupons Fiscais

> **IMPORTANTE**: O treinamento do modelo SÓ pode ser feito pela interface web do ExtractLab.
> A API serve apenas para EXTRAIR dados de documentos usando um modelo JÁ treinado.
> Não existe endpoint de API para criar ou treinar modelos.

---

## 📋 Pré-requisitos

Antes de começar, confirme que você tem:

- [x] Conta criada no ExtractLab → [Criar conta grátis](https://extractlab.com.br/Auth/Register)
- [x] Token de API gerado → [Configurações → Tokens](https://extractlab.com.br/Dashboard/Settings)
- [x] PDFs de treinamento gerados (veja "Gerar Documentos" abaixo)

### Plano Gratuito (Starter)
- ✅ 100 documentos/dia para extração
- ✅ 1 modelo personalizado
- ✅ Suporte comunidade

---

## 🚀 Passo a Passo Completo

### ETAPA 1: Gerar Documentos de Treinamento

Execute no terminal (dentro da pasta do projeto):

```bash
cd treinamento
node gerar-pdfs-treinamento.js
```

Isso gera **20 PDFs** de cupons fiscais na pasta `treinamento/pdfs/`.

> **Por que PDFs e não imagens?** PDFs contêm texto digital selecionável, o que
> facilita enormemente a anotação no ExtractLab. O OCR funciona muito melhor com
> texto nativo do que com imagens de texto.

### ETAPA 2: Criar o Modelo no ExtractLab

1. Acesse: **https://extractlab.com.br/Model/Create**
2. Preencha:
   - **Nome do Modelo**: `Cupom Mercado` (ou qualquer nome - anote!)
   - **Descrição**: `Extração de cupons fiscais de supermercado`
3. Clique em **"Criar"** ou **"Criar e Continuar"**

> ⚠️ O nome do modelo precisa ser EXATAMENTE igual ao configurado no `.env.local`
> do app. Se usar outro nome, atualize `EXTRACTLAB_MODEL_NAME` no `.env.local`
> e nas variáveis de ambiente do Vercel.

### ETAPA 3: Definir os Campos de Extração

Na tela do modelo, defina estes campos:

| # | Nome do Campo | Tipo | Descrição |
|---|---|---|---|
| 1 | `estabelecimento` | Texto | Nome ou razão social do mercado |
| 2 | `cnpj` | Texto | CNPJ do estabelecimento |
| 3 | `data_emissao` | Texto | Data e hora da emissão |
| 4 | `total_nota` | Texto | Valor total da nota (ex: 245,90) |
| 5 | `itens` | Texto Longo | Bloco INTEIRO com todos os produtos |
| 6 | `forma_pagamento` | Texto | Forma de pagamento usada |

> **DICA**: Use exatamente esses nomes de campo! O app (`receipt-parser.ts`)
> procura por esses nomes para interpretar a resposta da API.

### ETAPA 4: Upload e Anotação dos Documentos

1. Na tela do modelo, clique em **"Upload de Documentos"** ou **"Adicionar Documentos"**
2. **Arraste os 20 PDFs** da pasta `treinamento/pdfs/` para a área de upload
3. Aguarde o upload completo

**Para CADA documento**, você precisa ANOTAR os campos:

#### Como anotar cada campo:

**`estabelecimento`** → Selecione o nome da loja no TOPO do cupom
```
Exemplo: selecione "MINIMERCADO DA PANDIA" ou "CARREFOUR COM IND LTDA"
```

**`cnpj`** → Selecione o CNPJ completo
```
Exemplo: selecione "90.369.075/0001-37"
```

**`data_emissao`** → Selecione a data/hora
```
Exemplo: selecione "15/03/2025 14:32:18"
```

**`total_nota`** → Selecione o valor total da compra
```
Exemplo: selecione "414,68" (o valor numérico total)
```

**`itens`** → **SELECIONE O BLOCO INTEIRO** desde o primeiro produto até o último
```
Exemplo: selecione TUDO de "001 1234567 BAN PRATA" até o último item com valor
Inclua números, descrições, quantidades e valores
```

**`forma_pagamento`** → Selecione a forma de pagamento
```
Exemplo: selecione "CARTAO CREDITO" ou "Dinheiro" ou "PIX"
```

### ETAPA 5: Treinar o Modelo

1. Depois de anotar TODOS os documentos (mínimo 5, ideal 10+)
2. Clique no botão **"Treinar Modelo"** ou **"Iniciar Treinamento"**
3. Aguarde a conclusão (geralmente alguns minutos)
4. O status do modelo deve mudar para **"Treinado"** ✅

### ETAPA 6: Validar com o Script de Teste

Após o treinamento, rode o script de validação:

```bash
node treinamento/testar-extractlab.js
```

Se tudo estiver correto, você verá:
```
✅ Token válido e aceito pela API!
✅ Modelo "Cupom Mercado" encontrado e FUNCIONANDO!
  Campos extraídos:
    estabelecimento: MINIMERCADO DA PANDIA
      Confiança: ██████████ 98.5%
    ...
```

### ETAPA 7: Configurar no App

1. Abra: **https://appmercado-nine.vercel.app/settings**
2. Cole seu **Token da API**: `doc_ea59...` (começa com `doc_`)
3. **Nome do Modelo**: exatamente como criou (ex: `Cupom Mercado`)
4. **Salvar Configurações**
5. Vá em **Escanear** e teste com um cupom real! 🎉

---

## 🔧 Solução de Problemas

### ❌ "Modelo não encontrado" (HTTP 404)

**Causa**: O modelo não existe na sua conta ExtractLab.

**Solução**:
1. Verifique se criou o modelo em https://extractlab.com.br/Model/Index
2. Confirme que o nome no app é EXATAMENTE igual ao do ExtractLab
3. O nome é sensível a maiúsculas/minúsculas e espaços
4. Após criar, o modelo PRECISA ser treinado para funcionar

**Diagnóstico rápido**:
```bash
node treinamento/testar-extractlab.js
```

### ❌ "Token inválido" (HTTP 401)

**Causa**: Token expirado, incorreto ou não fornecido.

**Solução**:
1. Acesse https://extractlab.com.br/Dashboard/Settings
2. Gere um novo token (selecione "Nunca Expira" se disponível)
3. O token começa com `doc_`
4. Atualize em `.env.local` E no Vercel (Settings → Environment Variables)

### ❌ "Modelo não treinado" (HTTP 422)

**Causa**: O modelo foi criado mas ainda não recebeu treinamento.

**Solução**:
1. Acesse o modelo em https://extractlab.com.br/Model/Index
2. Upload documentos de treinamento
3. Anote os campos em cada documento
4. Clique em "Treinar Modelo"

### ❌ "Limite excedido" (HTTP 429)

**Causa**: Excedeu o limite de 100 documentos/dia (plano Starter).

**Solução**: Aguarde até o dia seguinte ou faça upgrade do plano.

### ❌ Campos extraídos com baixa confiança

**Causa**: Modelo precisa de mais exemplos de treinamento.

**Solução**:
1. Adicione mais documentos ao treinamento (10-20 ideal)
2. Certifique-se de que a anotação está precisa
3. Use cupons de mercados variados (diferentes formatos)
4. Re-treine o modelo

### ❌ Itens não são separados corretamente

**Causa**: O campo `itens` não foi anotado corretamente ou o parser precisa de ajuste.

**Solução**:
1. Ao anotar `itens`, selecione o BLOCO INTEIRO de produtos
2. Inclua números sequenciais, nomes abreviados, quantidades e valores
3. O app tem um parser (`receipt-parser.ts`) que interpreta vários formatos
4. Use a opção "Editar" no app para corrigir itens antes de salvar

---

## 📂 Estrutura de Arquivos

```
treinamento/
├── gerar-pdfs-treinamento.js   # Gerador de PDFs (USE ESTE!)
├── testar-extractlab.js        # Script de validação da API
├── gerar-100-cupons.js         # Gerador antigo (PNG - não recomendado)
├── gerar-cupons.js             # Gerador antigo (PNG - não recomendado)
├── pdfs/                       # PDFs gerados para treinamento ✅
│   ├── cupom_001.pdf
│   ├── cupom_002.pdf
│   └── ... (20 arquivos)
└── cupom_*.png                 # Imagens antigas (não usar para treinar)
```

---

## 🔌 Como a API Funciona

A ExtractLab tem apenas 3 endpoints (nenhum para treinamento):

| Endpoint | Método | Descrição |
|---|---|---|
| `/api/batch/extract` | POST | Extrai dados de 1 documento (síncrono) |
| `/api/batch/process` | POST | Processa até 10 documentos (assíncrono) |
| `/api/batch/{batchId}` | GET | Consulta status de um lote |

**O app usa `/api/batch/extract`** para processar um cupom de cada vez.

### Exemplo de requisição (cURL):
```bash
curl -X POST https://api.extractlab.com.br/api/batch/extract \
  -H "Authorization: Bearer doc_seu_token_aqui" \
  -F "file=@cupom.pdf" \
  -F "modelName=Cupom Mercado"
```

### Exemplo de resposta (JSON):
```json
{
  "documentId": 12345,
  "fileName": "cupom.pdf",
  "processedAt": "2025-12-18T10:30:00Z",
  "fields": [
    { "name": "estabelecimento", "value": "MINIMERCADO DA PANDIA", "confidence": 0.98 },
    { "name": "cnpj", "value": "90.369.075/0001-37", "confidence": 0.95 },
    { "name": "data_emissao", "value": "15/03/2025 14:32:18", "confidence": 0.97 },
    { "name": "total_nota", "value": "414,68", "confidence": 0.96 },
    { "name": "itens", "value": "001 BAN PRATA 1,250 KG x 5,99 7,49...", "confidence": 0.92 },
    { "name": "forma_pagamento", "value": "CARTAO CREDITO", "confidence": 0.94 }
  ]
}
```

**Confiança**: Valores acima de 0.85 são alta confiança. Abaixo disso, o app sugere revisão manual.

---

## ⚡ Comandos Rápidos (Terminal)

```bash
# Gerar PDFs de treinamento
cd treinamento && node gerar-pdfs-treinamento.js

# Testar API e modelo
node treinamento/testar-extractlab.js

# Testar com modelo diferente
node treinamento/testar-extractlab.js --modelo "Outro Nome"

# Testar com arquivo específico
node treinamento/testar-extractlab.js --arquivo meu_cupom.pdf

# Ver variáveis de ambiente
type .env.local
```

---

## 🌐 Links Úteis

| Recurso | URL |
|---|---|
| ExtractLab - Criar Modelo | https://extractlab.com.br/Model/Create |
| ExtractLab - Seus Modelos | https://extractlab.com.br/Model/Index |
| ExtractLab - Tokens | https://extractlab.com.br/Dashboard/Settings |
| ExtractLab - Documentação API | https://extractlab.com.br/Home/Documentation |
| ExtractLab - Swagger/API Explorer | https://api.extractlab.com.br/swagger |
| MercadoApp | https://appmercado-nine.vercel.app |
| MercadoApp - Configurações | https://appmercado-nine.vercel.app/settings |
| MercadoApp - Escanear | https://appmercado-nine.vercel.app/scan |
| GitHub | https://github.com/VNCRIBEIRO1/appmercado |
