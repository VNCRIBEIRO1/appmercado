/**
 * ================================================
 * SCRIPT DE VALIDAÇÃO E TESTE - ExtractLab API
 * ================================================
 * 
 * Este script verifica:
 * 1. Se o token da API está válido
 * 2. Se o modelo existe e está treinado
 * 3. Faz um teste de extração com um cupom
 * 4. Mostra os campos extraídos
 * 
 * Uso: node testar-extractlab.js
 * 
 * Parâmetros opcionais:
 *   --modelo "Nome do Modelo"    (default: valor do .env.local)
 *   --arquivo caminho/cupom.pdf  (default: usa um PDF da pasta pdfs/)
 * ================================================
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const API_URL = 'https://api.extractlab.com.br';

// Ler configurações
const TOKEN = process.env.EXTRACTLAB_API_TOKEN;
const MODEL_NAME = getArg('--modelo') || process.env.EXTRACTLAB_MODEL_NAME || 'Cupom Mercado';
const TEST_FILE = getArg('--arquivo');

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : null;
}

// Cores para terminal
const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function log(msg, color = '') { console.log(`${color}${msg}${C.reset}`); }
function logOK(msg) { log(`  ✅ ${msg}`, C.green); }
function logERR(msg) { log(`  ❌ ${msg}`, C.red); }
function logWARN(msg) { log(`  ⚠️  ${msg}`, C.yellow); }
function logINFO(msg) { log(`  ℹ️  ${msg}`, C.cyan); }

async function main() {
  log('\n' + '='.repeat(55), C.bold);
  log('  🔍 VALIDAÇÃO DA API ExtractLab', C.bold + C.cyan);
  log('='.repeat(55), C.bold);

  // ---- PASSO 1: Verificar .env.local ----
  log('\n📋 PASSO 1: Verificando configuração (.env.local)', C.bold);
  
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    logERR('Arquivo .env.local não encontrado!');
    logINFO('Crie o arquivo .env.local na raiz do projeto com:');
    log('    EXTRACTLAB_API_TOKEN=doc_seu_token_aqui');
    log('    EXTRACTLAB_MODEL_NAME=Cupom Mercado');
    process.exit(1);
  }
  logOK('.env.local encontrado');

  if (!TOKEN) {
    logERR('EXTRACTLAB_API_TOKEN não definido no .env.local!');
    process.exit(1);
  }
  logOK(`Token encontrado: ${TOKEN.substring(0, 12)}...${TOKEN.substring(TOKEN.length - 6)}`);
  logOK(`Modelo configurado: "${MODEL_NAME}"`);

  // ---- PASSO 2: Testar autenticação ----
  log('\n📋 PASSO 2: Testando autenticação na API', C.bold);

  try {
    // Vamos fazer uma requisição para ver se o token é aceito
    // Usamos um modelo falso para testar - se receber 404 = token ok, se 401 = token inválido
    const testResult = await makeRequest('__test_auth__', null);
    
    if (testResult.httpStatus === 401) {
      logERR('Token INVÁLIDO ou EXPIRADO!');
      logINFO('Gere um novo token em: https://extractlab.com.br/Dashboard/Settings');
      logINFO('Ao criar, selecione "Nunca Expira" se disponível.');
      process.exit(1);
    } else if (testResult.httpStatus === 404) {
      logOK('Token válido e aceito pela API!');
    } else if (testResult.httpStatus === 400) {
      logOK('Token aceito pela API (resposta 400 = falta arquivo, mas auth ok)');
    } else {
      logWARN(`Resposta inesperada: HTTP ${testResult.httpStatus}`);
      logINFO(`Body: ${JSON.stringify(testResult.body)}`);
    }
  } catch (err) {
    logERR(`Erro de conexão: ${err.message}`);
    logINFO('Verifique sua conexão com a internet.');
    process.exit(1);
  }

  // ---- PASSO 3: Verificar se o modelo existe ----
  log('\n📋 PASSO 3: Verificando modelo "' + MODEL_NAME + '"', C.bold);

  // Encontrar arquivo de teste
  let testFilePath = TEST_FILE;
  if (!testFilePath) {
    // Procurar na pasta pdfs/
    const pdfDir = path.join(__dirname, 'pdfs');
    if (fs.existsSync(pdfDir)) {
      const pdfs = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
      if (pdfs.length > 0) {
        testFilePath = path.join(pdfDir, pdfs[0]);
      }
    }
    // Procurar PNGs na pasta atual
    if (!testFilePath) {
      const pngs = fs.readdirSync(__dirname).filter(f => f.endsWith('.png'));
      if (pngs.length > 0) {
        testFilePath = path.join(__dirname, pngs[0]);
      }
    }
  }

  if (!testFilePath || !fs.existsSync(testFilePath)) {
    logWARN('Nenhum arquivo de teste encontrado para enviar à API.');
    logINFO('Execute primeiro: node gerar-pdfs-treinamento.js');
    logINFO('Ou especifique: node testar-extractlab.js --arquivo caminho/cupom.pdf');
    
    log('\n📋 PASSO 4: Verificação parcial (sem arquivo de teste)', C.bold);
    logWARN('Não foi possível testar a extração sem um arquivo.');
    mostrarResumo(true, null, MODEL_NAME);
    process.exit(0);
  }

  logINFO(`Arquivo de teste: ${path.basename(testFilePath)}`);

  // Testar extração
  const result = await makeRequest(MODEL_NAME, testFilePath);

  if (result.httpStatus === 404) {
    logERR(`Modelo "${MODEL_NAME}" NÃO ENCONTRADO!`);
    log('');
    logWARN('Isso significa que o modelo ainda não foi criado ou treinado no ExtractLab.');
    log('');
    log('    📌 COMO RESOLVER:', C.bold + C.yellow);
    log('    1. Acesse: https://extractlab.com.br/Model/Create');
    log('    2. Crie um modelo com nome EXATO: "' + MODEL_NAME + '"');
    log('    3. Defina os campos (veja abaixo)');
    log('    4. Faça upload dos PDFs da pasta: treinamento/pdfs/');
    log('    5. Anote cada campo em cada documento');
    log('    6. Clique em "Treinar Modelo"');
    log('    7. Depois rode este script novamente para confirmar!');
    log('');
    mostrarCamposRecomendados();
    process.exit(1);
  } else if (result.httpStatus === 200) {
    logOK(`Modelo "${MODEL_NAME}" encontrado e FUNCIONANDO!`);
    
    // ---- PASSO 4: Mostrar resultado da extração ----
    log('\n📋 PASSO 4: Resultado da extração', C.bold);
    
    if (result.body && result.body.fields) {
      log('\n  Campos extraídos:', C.cyan);
      result.body.fields.forEach(field => {
        const confColor = field.confidence >= 0.85 ? C.green : 
                          field.confidence >= 0.60 ? C.yellow : C.red;
        const confBar = '█'.repeat(Math.round(field.confidence * 10)) + '░'.repeat(10 - Math.round(field.confidence * 10));
        log(`    ${C.bold}${field.name}${C.reset}: ${field.value || '(vazio)'}`);
        log(`      Confiança: ${confColor}${confBar} ${(field.confidence * 100).toFixed(1)}%${C.reset}`);
      });

      // Verificar campos importantes
      const fieldNames = result.body.fields.map(f => f.name.toLowerCase());
      log('\n  Verificação de campos:', C.cyan);
      
      const camposEsperados = ['estabelecimento', 'data_emissao', 'total_nota', 'itens', 'cnpj'];
      camposEsperados.forEach(campo => {
        const found = fieldNames.some(f => f.includes(campo.replace('_', '')));
        if (found) {
          logOK(`Campo "${campo}" encontrado`);
        } else {
          logWARN(`Campo "${campo}" NÃO encontrado - pode precisar ser adicionado ao modelo`);
        }
      });
    } else {
      logWARN('Resposta sem campos extraídos');
      logINFO(`Resposta completa: ${JSON.stringify(result.body, null, 2)}`);
    }
    
    mostrarResumo(true, result.body, MODEL_NAME);
  } else if (result.httpStatus === 422) {
    logWARN(`Modelo "${MODEL_NAME}" existe mas AINDA NÃO FOI TREINADO!`);
    logINFO('O modelo foi criado mas precisa ser treinado com documentos anotados.');
    logINFO('Acesse: https://extractlab.com.br/Model/Index');
    mostrarResumo(false, null, MODEL_NAME);
  } else if (result.httpStatus === 429) {
    logWARN('Limite mensal de documentos excedido!');
    logINFO('O plano Starter permite 100 docs/dia.');
  } else {
    logERR(`Erro inesperado: HTTP ${result.httpStatus}`);
    logINFO(`Resposta: ${JSON.stringify(result.body)}`);
  }
}

function mostrarCamposRecomendados() {
  log('    📝 CAMPOS RECOMENDADOS PARA O MODELO:', C.bold + C.cyan);
  log('    ┌──────────────────────┬──────────────┬──────────────────────────────┐');
  log('    │ Nome do Campo        │ Tipo         │ O que marcar                 │');
  log('    ├──────────────────────┼──────────────┼──────────────────────────────┤');
  log('    │ estabelecimento      │ Texto        │ Nome/razão social da loja    │');
  log('    │ cnpj                 │ Texto        │ CNPJ do estabelecimento      │');
  log('    │ data_emissao         │ Texto        │ Data e hora da compra        │');
  log('    │ total_nota           │ Texto        │ Valor total (R$ XX,XX)       │');
  log('    │ itens                │ Texto Longo  │ BLOCO INTEIRO de produtos    │');
  log('    │ forma_pagamento      │ Texto        │ Forma de pagamento           │');
  log('    └──────────────────────┴──────────────┴──────────────────────────────┘');
}

function mostrarResumo(tokenOk, extractResult, modelName) {
  log('\n' + '='.repeat(55), C.bold);
  log('  📊 RESUMO DA VALIDAÇÃO', C.bold + C.cyan);
  log('='.repeat(55), C.bold);
  
  log(`\n  Token API:     ${tokenOk ? '✅ Válido' : '❌ Inválido'}`, tokenOk ? C.green : C.red);
  log(`  Modelo:        ${extractResult ? '✅ ' + modelName + ' (treinado)' : '❌ ' + modelName + ' (não encontrado)'}`, extractResult ? C.green : C.red);
  log(`  Extração:      ${extractResult?.fields ? '✅ Funcionando (' + extractResult.fields.length + ' campos)' : '❌ Não testada'}`, extractResult?.fields ? C.green : C.red);
  
  if (!extractResult) {
    log('\n  ⚡ AÇÃO NECESSÁRIA:', C.bold + C.yellow);
    log('     Crie e treine o modelo no site ExtractLab.');
    log('     Consulte: GUIA_TREINAMENTO_EXTRACTLAB.md');
    log('     Depois rode: node treinamento/testar-extractlab.js');
  } else {
    log('\n  🎉 TUDO FUNCIONANDO!', C.bold + C.green);
    log('     O app está pronto para escanear cupons.');
    log('     Teste em: https://appmercado-nine.vercel.app/scan');
  }
  
  log('\n' + '='.repeat(55) + '\n', C.bold);
}

async function makeRequest(modelName, filePath) {
  // Usando fetch nativo (Node 18+) ou undici
  const FormData = (await import('node:buffer')).Buffer ? null : null;
  
  // Construir multipart form data manualmente
  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];
  
  // ModelName field
  parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="modelName"\r\n\r\n${modelName}`);
  
  // File field (se houver)
  if (filePath && fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png';
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`);
    
    // Combinar partes em um único buffer
    const preParts = parts.join('\r\n');
    const postPart = `\r\n--${boundary}--\r\n`;
    
    const preBuffer = Buffer.from(preParts, 'utf-8');
    const postBuffer = Buffer.from(postPart, 'utf-8');
    const body = Buffer.concat([preBuffer, fileData, postBuffer]);
    
    const response = await fetch(`${API_URL}/api/batch/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }
    
    return { httpStatus: response.status, body: responseBody };
  } else {
    // Sem arquivo - só para testar auth
    const textBody = parts.join('\r\n') + `\r\n--${boundary}--\r\n`;
    
    const response = await fetch(`${API_URL}/api/batch/extract`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: textBody,
    });

    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }
    
    return { httpStatus: response.status, body: responseBody };
  }
}

main().catch(err => {
  logERR(`Erro fatal: ${err.message}`);
  console.error(err);
  process.exit(1);
});
