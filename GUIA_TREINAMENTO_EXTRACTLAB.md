# 📘 Guia de Treinamento - ExtractLab para Cupons Fiscais

## Visão Geral

A ExtractLab usa **modelos treinados** para extrair dados de documentos. Antes de o OCR funcionar no app, você precisa:

1. ✅ Criar uma conta na ExtractLab
2. ✅ Gerar um token de API
3. 🔲 Criar um modelo de extração
4. 🔲 Definir os campos de extração
5. 🔲 Treinar o modelo com documentos de exemplo

---

## Passo 1: Criar o Modelo

1. Acesse: [https://extractlab.com.br/Model/Create](https://extractlab.com.br/Model/Create)
2. **Nome do Modelo**: `Cupom Mercado` (use este nome exato ou anote o que escolher)
3. **Descrição**: `Extração de cupons fiscais de supermercado`
4. Clique em **Criar**

> ⚠️ **IMPORTANTE**: O nome do modelo deve ser EXATAMENTE igual ao configurado no app (em Configurações). Se usar outro nome, atualize no app também.

---

## Passo 2: Definir os Campos de Extração

Ao criar o modelo, defina estes campos (copie os nomes exatamente):

### Campos Obrigatórios

| Nome do Campo | Tipo | O que marcar no documento |
|---|---|---|
| `estabelecimento` | Texto | Nome/razão social do mercado (geralmente no topo do cupom) |
| `data_emissao` | Data | Data e hora do cupom (formato DD/MM/AAAA HH:MM) |
| `total_nota` | Número | Valor total da compra (geralmente no final, "TOTAL R$") |
| `itens` | Texto Longo | **BLOCO INTEIRO** com todos os itens, quantidades e valores |

### Campos Opcionais (melhoram a precisão)

| Nome do Campo | Tipo | O que marcar |
|---|---|---|
| `cnpj` | Texto | CNPJ do estabelecimento |
| `forma_pagamento` | Texto | Forma de pagamento (Crédito, Débito, Dinheiro, PIX) |

---

## Passo 3: Preparar Documentos de Treinamento

### Quantos documentos?
- **Mínimo**: 5 documentos
- **Recomendado**: 10-20 documentos
- **Ideal**: 20+ para máxima precisão

### Tipos de documentos aceitos
- 📸 Fotos (JPG, PNG) - tiradas com celular
- 📄 PDFs - cupons digitais (SAT, NFC-e)

### Dicas para melhores resultados

✅ **FAÇA:**
- Use cupons de **mercados diferentes** (Pão de Açúcar, Carrefour, Assaí, etc.)
- Inclua cupons com **quantidades variadas** de itens (5, 15, 30+ itens)
- Misture **fotos de celular** com **PDFs** digitais
- Inclua cupons com itens **por kg** (frutas, carnes) e **por unidade**
- Fotografe com **boa iluminação** e **sem sombras**
- Tire a foto **de cima para baixo** (perpendicular ao cupom)

❌ **EVITE:**
- Fotos borradas ou desfocadas
- Cupons amassados ou rasgados
- Fotos com muita sombra ou reflexo
- Usar apenas cupons do mesmo mercado
- Cupons cortados (pegue o cupom inteiro)

---

## Passo 4: Treinar o Modelo

### Upload dos documentos

1. Na tela do modelo, clique em **"Upload de Documentos"**
2. Selecione seus cupons fiscais (5-20 arquivos)
3. Aguarde o upload completo

### Anotação dos campos

Para CADA documento enviado:

1. **estabelecimento**: Clique e arraste para selecionar o nome do mercado no topo
2. **data_emissao**: Selecione a data de emissão
3. **total_nota**: Selecione o valor total (ex: "TOTAL R$ 245,90")
4. **itens**: Selecione o **BLOCO INTEIRO** de itens - desde o primeiro produto até o último

#### Exemplo de seleção do campo "itens":

```
001 ARROZ TIPO 1 5KG        1 UN x 23,90   23,90
002 FEIJAO CARIOCA 1KG      2 UN x 8,90    17,80
003 LEITE INTEGRAL          6 UN x 5,49    32,94
004 BANANA PRATA            1,250 KG x 6,99 8,74
005 PEITO DE FRANGO         0,875 KG x 24,90 21,79
006 PÃO FRANCÊS             0,500 KG x 19,90 9,95
007 DETERGENTE LIMPOL       3 UN x 2,89     8,67
```

> 💡 Selecione TODO o bloco de itens, incluindo códigos, nomes, quantidades e valores. O app vai interpretar cada linha automaticamente.

### Iniciar Treinamento

1. Depois de anotar todos os documentos, clique em **"Treinar Modelo"**
2. Aguarde a conclusão (pode levar alguns minutos)
3. O status mudará para **"Treinado"** ✅

---

## Passo 5: Configurar no App

1. Abra o app: [https://appmercado-nine.vercel.app/settings](https://appmercado-nine.vercel.app/settings)
2. Cole seu **Token da API** (gerado em Configurações → Tokens)
3. Digite o **Nome do Modelo** exatamente como criou (ex: `Cupom Mercado`)
4. Clique em **Salvar Configurações**
5. Vá em **Escanear** e teste com um cupom! 🎉

---

## Solução de Problemas

### Erro "Modelo não encontrado"
- Verifique se o nome do modelo no app é EXATAMENTE igual ao da ExtractLab
- Confirme que o modelo foi treinado com sucesso
- Nomes são sensíveis a maiúsculas/minúsculas

### Erro "Token inválido"
- Gere um novo token na ExtractLab
- Use a opção "Nunca Expira" ao criar
- Cole o token completo (começa com `doc_`)

### OCR lê incorretamente
- Treine com mais documentos variados
- Use fotos com melhor qualidade
- Verifique se os campos foram anotados corretamente no treinamento
- Use a opção "Editar" no app para corrigir itens antes de salvar

### Itens não são separados corretamente
- No treinamento, certifique-se de que o campo `itens` inclui todo o bloco de produtos
- O app tem um parser que interpreta os formatos mais comuns de cupom brasileiro
- Você sempre pode editar os itens manualmente após o scan

---

## Formatos de Cupom Suportados pelo Parser

O app reconhece automaticamente estes formatos de linha de cupom:

| Formato | Exemplo |
|---|---|
| Código + Nome + Qtd x Preço | `001 ARROZ 5KG 1 UN X 23,90 23,90` |
| Nome + Qtd x Preço | `LEITE INTEGRAL 6 X 5,49 32,94` |
| Nome + Preço | `BANANA PRATA KG 8,90` |
| Qtd + Unidade + Preço (linha separada) | `1,250 KG x 6,99` |

---

## Links Úteis

- 🌐 [ExtractLab - Criar Modelo](https://extractlab.com.br/Model/Create)
- 🔑 [ExtractLab - Tokens](https://extractlab.com.br/Dashboard/Settings)
- 📖 [ExtractLab - Documentação API](https://extractlab.com.br/Home/Documentation)
- 📱 [MercadoApp](https://appmercado-nine.vercel.app)
- ⚙️ [MercadoApp - Configurações](https://appmercado-nine.vercel.app/settings)
