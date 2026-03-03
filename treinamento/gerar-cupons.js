const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// =============================================
// GERADOR DE CUPONS FISCAIS PARA TREINAMENTO
// Gera 15 cupons realistas de mercados brasileiros
// =============================================

const STORES = [
  {
    name: 'SUPERMERCADO EXTRA HIPERMERCADO',
    fantasia: 'EXTRA HIPER',
    cnpj: '47.508.411/0157-32',
    ie: '562.377.112.117',
    address: 'AV. GIOVANNI GRONCHI, 5819 - MORUMBI',
    city: 'SAO PAULO - SP',
    cep: '05724-003',
  },
  {
    name: 'CARREFOUR COMERCIO E INDUSTRIA LTDA',
    fantasia: 'CARREFOUR',
    cnpj: '45.543.915/0329-81',
    ie: '636.092.344.118',
    address: 'ROD. RAPOSO TAVARES, KM 14,5',
    city: 'SAO PAULO - SP',
    cep: '05577-200',
  },
  {
    name: 'SENDAS DISTRIBUIDORA S.A.',
    fantasia: 'ASSAI ATACADISTA',
    cnpj: '03.258.372/0100-43',
    ie: '112.654.998.001',
    address: 'AV. ARICANDUVA, 5555 - ARICANDUVA',
    city: 'SAO PAULO - SP',
    cep: '03527-000',
  },
  {
    name: 'COMPANHIA BRASILEIRA DE DISTRIBUICAO',
    fantasia: 'PAO DE ACUCAR',
    cnpj: '47.508.411/0220-56',
    ie: '562.377.115.998',
    address: 'R. TEODORO SAMPAIO, 1840 - PINHEIROS',
    city: 'SAO PAULO - SP',
    cep: '05406-200',
  },
  {
    name: 'COOP COOPERATIVA DE CONSUMO',
    fantasia: 'COOP',
    cnpj: '57.500.725/0032-12',
    ie: '645.012.890.115',
    address: 'AV. KENNEDY, 1500 - CENTRO',
    city: 'SANTO ANDRE - SP',
    cep: '09015-100',
  },
  {
    name: 'WMS SUPERMERCADOS DO BRASIL LTDA',
    fantasia: 'WALMART / BIG',
    cnpj: '93.209.765/0517-33',
    ie: '116.887.332.009',
    address: 'AV. INTERLAGOS, 2255 - INTERLAGOS',
    city: 'SAO PAULO - SP',
    cep: '04661-100',
  },
  {
    name: 'DIA BRASIL SOCIEDADE LIMITADA',
    fantasia: 'DIA SUPERMERCADO',
    cnpj: '03.476.811/0188-67',
    ie: '149.300.715.110',
    address: 'R. AMADOR BUENO, 333 - SANTO AMARO',
    city: 'SAO PAULO - SP',
    cep: '04752-005',
  },
  {
    name: 'SONDA SUPERMERCADOS LTDA',
    fantasia: 'SONDA',
    cnpj: '62.809.834/0099-41',
    ie: '335.720.812.990',
    address: 'AV. CUPECE, 4100 - JABAQUARA',
    city: 'SAO PAULO - SP',
    cep: '04366-002',
  },
];

const PRODUCTS = {
  // Frutas e Verduras
  'frutas': [
    { name: 'BANANA PRATA', unit: 'KG', priceRange: [4.99, 8.99] },
    { name: 'MACA FUJI KG', unit: 'KG', priceRange: [8.99, 14.99] },
    { name: 'LARANJA PERA', unit: 'KG', priceRange: [3.99, 7.99] },
    { name: 'TOMATE ITALIANO', unit: 'KG', priceRange: [6.99, 12.99] },
    { name: 'BATATA LAVADA', unit: 'KG', priceRange: [4.49, 8.49] },
    { name: 'CEBOLA NACIONAL', unit: 'KG', priceRange: [3.99, 7.99] },
    { name: 'ALFACE CRESPA', unit: 'UN', priceRange: [2.49, 4.99] },
    { name: 'CENOURA', unit: 'KG', priceRange: [4.99, 9.99] },
    { name: 'MAMAO PAPAIA', unit: 'KG', priceRange: [6.99, 11.99] },
    { name: 'MELANCIA', unit: 'KG', priceRange: [2.99, 5.99] },
    { name: 'UVA ITALIA', unit: 'KG', priceRange: [9.99, 18.99] },
    { name: 'ABACAXI PEROLA', unit: 'UN', priceRange: [4.99, 9.99] },
    { name: 'LIMAO TAHITI', unit: 'KG', priceRange: [4.99, 9.99] },
  ],
  // Carnes
  'carnes': [
    { name: 'PEITO DE FRANGO CONGELADO', unit: 'KG', priceRange: [14.99, 24.99] },
    { name: 'CARNE MOIDA PATINHO', unit: 'KG', priceRange: [29.99, 44.99] },
    { name: 'COSTELA BOVINA', unit: 'KG', priceRange: [24.99, 39.99] },
    { name: 'LINGUICA TOSCANA', unit: 'KG', priceRange: [19.99, 32.99] },
    { name: 'COXA SOBRECOXA FRANGO', unit: 'KG', priceRange: [11.99, 19.99] },
    { name: 'ALCATRA BOVINA', unit: 'KG', priceRange: [39.99, 59.99] },
    { name: 'SALSICHA HOT DOG 500G', unit: 'UN', priceRange: [5.99, 12.99] },
    { name: 'BACON FATIADO 250G', unit: 'UN', priceRange: [9.99, 16.99] },
    { name: 'PRESUNTO COZIDO SADIA', unit: 'KG', priceRange: [24.99, 39.99] },
    { name: 'MORTADELA BOLOGNA', unit: 'KG', priceRange: [12.99, 22.99] },
  ],
  // Laticínios
  'laticinios': [
    { name: 'LEITE INTEGRAL PARMALAT 1L', unit: 'UN', priceRange: [4.99, 7.49] },
    { name: 'QUEIJO MUSSARELA', unit: 'KG', priceRange: [34.99, 49.99] },
    { name: 'IOGURTE NATURAL NESTLE', unit: 'UN', priceRange: [4.49, 7.99] },
    { name: 'MANTEIGA AVIACAO 200G', unit: 'UN', priceRange: [8.99, 14.99] },
    { name: 'REQUEIJAO CATUPIRY 200G', unit: 'UN', priceRange: [7.99, 12.99] },
    { name: 'CREME DE LEITE NESTLE 200G', unit: 'UN', priceRange: [3.49, 5.99] },
    { name: 'LEITE CONDENSADO MOCA 395G', unit: 'UN', priceRange: [6.49, 9.99] },
    { name: 'QUEIJO PRATO FATIADO', unit: 'KG', priceRange: [39.99, 54.99] },
  ],
  // Mercearia
  'mercearia': [
    { name: 'ARROZ TIPO 1 CAMIL 5KG', unit: 'UN', priceRange: [19.99, 29.99] },
    { name: 'FEIJAO CARIOCA CAMIL 1KG', unit: 'UN', priceRange: [6.99, 11.99] },
    { name: 'ACUCAR CRISTAL UNIAO 1KG', unit: 'UN', priceRange: [4.49, 6.99] },
    { name: 'CAFE PILAO 500G', unit: 'UN', priceRange: [14.99, 22.99] },
    { name: 'OLEO DE SOJA LIZA 900ML', unit: 'UN', priceRange: [5.99, 9.49] },
    { name: 'MACARRAO ESPAGUETE BARILLA', unit: 'UN', priceRange: [4.99, 8.99] },
    { name: 'MOLHO DE TOMATE POMAROLA', unit: 'UN', priceRange: [3.49, 5.99] },
    { name: 'SAL REFINADO CISNE 1KG', unit: 'UN', priceRange: [2.49, 4.49] },
    { name: 'FARINHA DE TRIGO DONA BENTA', unit: 'UN', priceRange: [4.99, 7.99] },
    { name: 'AZEITE EXTRA VIRGEM GALLO', unit: 'UN', priceRange: [22.99, 39.99] },
    { name: 'ACHOC EM PO NESCAU 400G', unit: 'UN', priceRange: [8.99, 14.99] },
  ],
  // Bebidas
  'bebidas': [
    { name: 'COCA COLA 2L', unit: 'UN', priceRange: [8.99, 12.99] },
    { name: 'GUARANA ANTARTICA 2L', unit: 'UN', priceRange: [7.49, 10.99] },
    { name: 'SUCO DEL VALLE 1L', unit: 'UN', priceRange: [6.99, 9.99] },
    { name: 'AGUA MINERAL CRYSTAL 1,5L', unit: 'UN', priceRange: [2.49, 4.49] },
    { name: 'CERVEJA BRAHMA LATA 350ML', unit: 'UN', priceRange: [3.49, 5.99] },
    { name: 'CERVEJA SKOL LATA 350ML', unit: 'UN', priceRange: [3.29, 5.49] },
  ],
  // Limpeza
  'limpeza': [
    { name: 'DETERGENTE LIMPOL 500ML', unit: 'UN', priceRange: [2.49, 4.49] },
    { name: 'SABAO EM PO OMO 800G', unit: 'UN', priceRange: [12.99, 19.99] },
    { name: 'AGUA SANITARIA QBOA 1L', unit: 'UN', priceRange: [3.99, 6.49] },
    { name: 'DESINFETANTE PINHO SOL 500ML', unit: 'UN', priceRange: [4.99, 7.99] },
    { name: 'ESPONJA SCOTCH BRITE', unit: 'UN', priceRange: [2.99, 5.49] },
    { name: 'PAPEL TOALHA SNOB 2UN', unit: 'UN', priceRange: [5.99, 9.99] },
    { name: 'SACO DE LIXO 50L 10UN', unit: 'UN', priceRange: [6.99, 11.99] },
    { name: 'AMACIANTE COMFORT 1L', unit: 'UN', priceRange: [9.99, 16.99] },
  ],
  // Higiene
  'higiene': [
    { name: 'PAPEL HIGIENICO NEVE 12UN', unit: 'UN', priceRange: [14.99, 24.99] },
    { name: 'SABONETE DOVE 90G', unit: 'UN', priceRange: [3.49, 5.99] },
    { name: 'SHAMPOO PANTENE 400ML', unit: 'UN', priceRange: [16.99, 24.99] },
    { name: 'PASTA DENTAL COLGATE 90G', unit: 'UN', priceRange: [4.99, 8.49] },
    { name: 'DESODORANTE REXONA 150ML', unit: 'UN', priceRange: [12.99, 19.99] },
    { name: 'ABSORVENTE ALWAYS C/8', unit: 'UN', priceRange: [6.99, 12.99] },
  ],
  // Padaria/Congelados
  'padaria': [
    { name: 'PAO FRANCES', unit: 'KG', priceRange: [14.99, 22.99] },
    { name: 'PAO DE FORMA PULLMAN', unit: 'UN', priceRange: [7.99, 12.99] },
    { name: 'BISC RECHEADO OREO 90G', unit: 'UN', priceRange: [3.49, 5.99] },
    { name: 'BOLACHA CREAM CRACKER', unit: 'UN', priceRange: [4.49, 7.99] },
    { name: 'PIZZA CONGELADA SADIA', unit: 'UN', priceRange: [14.99, 22.99] },
    { name: 'SORVETE KIBON 1,5L', unit: 'UN', priceRange: [19.99, 29.99] },
    { name: 'BOLO PRONTO PULLMAN', unit: 'UN', priceRange: [9.99, 15.99] },
  ],
};

// Utility functions
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function formatPrice(price) {
  return price.toFixed(2).replace('.', ',');
}

function padRight(str, len) {
  return str.substring(0, len).padEnd(len);
}

function padLeft(str, len) {
  return str.substring(0, len).padStart(len);
}

function randomDate() {
  const year = 2025;
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  const hour = randomInt(7, 21);
  const min = randomInt(0, 59);
  const sec = randomInt(0, 59);
  return {
    formatted: `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year} ${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`,
    iso: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
  };
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomProducts(count) {
  const allProducts = Object.values(PRODUCTS).flat();
  const shuffled = allProducts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateSATNumber() {
  let sat = '';
  for (let i = 0; i < 44; i++) sat += randomInt(0, 9);
  return sat;
}

// =============================================
// RECEIPT FORMATS - Different styles
// =============================================

function generateReceiptFormat1(store, items, date, receiptNum) {
  // Format 1: Classic SAT NFC-e with item codes
  let lines = [];
  const divider = '='.repeat(48);
  const divider2 = '-'.repeat(48);

  lines.push(`<div class="receipt" style="font-family: 'Courier New', monospace; font-size: 11px; width: 320px; padding: 15px; background: white; color: #111; line-height: 1.4;">`);
  lines.push(`<div style="text-align:center; font-weight:bold;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;">${store.fantasia}</div>`);
  lines.push(`<div style="text-align:center;">CNPJ: ${store.cnpj} IE: ${store.ie}</div>`);
  lines.push(`<div style="text-align:center;">${store.address}</div>`);
  lines.push(`<div style="text-align:center;">${store.city} CEP: ${store.cep}</div>`);
  lines.push(`<div style="text-align:center;">${divider}</div>`);
  lines.push(`<div style="text-align:center; font-weight:bold;">CUPOM FISCAL ELETRONICO - SAT</div>`);
  lines.push(`<div style="text-align:center;">EXTRATO No. ${String(receiptNum).padStart(6, '0')}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div>CPF/CNPJ do Consumidor: NAO INFORMADO</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="font-weight:bold;"># COD   DESCRICAO              QTD  UN  VL.UNIT   TOTAL</div>`);
  lines.push(`<div>${divider2}</div>`);

  let total = 0;
  items.forEach((item, idx) => {
    const price = parseFloat(randomBetween(item.priceRange[0], item.priceRange[1]).toFixed(2));
    let qty, qtyStr;
    if (item.unit === 'KG') {
      qty = parseFloat(randomBetween(0.3, 3.5).toFixed(3));
      qtyStr = qty.toFixed(3).replace('.', ',');
    } else {
      qty = randomInt(1, 8);
      qtyStr = String(qty);
    }
    const itemTotal = parseFloat((qty * price).toFixed(2));
    total += itemTotal;

    const code = String(randomInt(1000, 99999)).padStart(5, '0');
    const num = String(idx + 1).padStart(3, '0');
    lines.push(`<div>${num} ${code} ${item.name}</div>`);
    lines.push(`<div>    ${qtyStr} ${item.unit} X ${formatPrice(price)}${' '.repeat(Math.max(1, 28 - formatPrice(itemTotal).length))}${formatPrice(itemTotal)}</div>`);
  });

  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="font-weight:bold; font-size:13px;">TOTAL R$${' '.repeat(Math.max(1, 35 - formatPrice(total).length))}${formatPrice(total)}</div>`);
  lines.push(`<div>${divider2}</div>`);

  // Payment
  const paymentType = pickRandom(['CARTAO CREDITO', 'CARTAO DEBITO', 'DINHEIRO', 'PIX']);
  if (paymentType === 'DINHEIRO') {
    const paid = Math.ceil(total / 10) * 10;
    lines.push(`<div>DINHEIRO${' '.repeat(Math.max(1, 38 - formatPrice(paid).length))}${formatPrice(paid)}</div>`);
    lines.push(`<div>TROCO R$${' '.repeat(Math.max(1, 35 - formatPrice(paid - total).length))}${formatPrice(paid - total)}</div>`);
  } else {
    lines.push(`<div>${paymentType}${' '.repeat(Math.max(1, 42 - paymentType.length - formatPrice(total).length))}${formatPrice(total)}</div>`);
  }

  lines.push(`<div>${divider2}</div>`);
  lines.push(`<div>QTD. TOTAL DE ITENS: ${items.length}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="text-align:center;">SAT No.: ${generateSATNumber()}</div>`);
  lines.push(`<div style="text-align:center;">${date.formatted}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="text-align:center; font-size:9px;">OBRIGADO! VOLTE SEMPRE!</div>`);
  lines.push(`</div>`);

  return lines.join('\n');
}

function generateReceiptFormat2(store, items, date, receiptNum) {
  // Format 2: NFC-e style (more compact, no SAT)
  let lines = [];
  const divider = '*'.repeat(44);
  const divider2 = '-'.repeat(44);

  lines.push(`<div class="receipt" style="font-family: 'Courier New', monospace; font-size: 11px; width: 310px; padding: 15px; background: white; color: #111; line-height: 1.4;">`);
  lines.push(`<div style="text-align:center; font-weight:bold; font-size:13px;">${store.fantasia}</div>`);
  lines.push(`<div style="text-align:center;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;">CNPJ: ${store.cnpj}</div>`);
  lines.push(`<div style="text-align:center;">${store.address}</div>`);
  lines.push(`<div style="text-align:center;">${store.city}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="text-align:center;">DANFE NFC-e - Doc Auxiliar da NFe</div>`);
  lines.push(`<div style="text-align:center;">NAO PERMITE APROVEITAMENTO DE CREDITO</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="font-size:10px;">CODIGO DESCRICAO</div>`);
  lines.push(`<div style="font-size:10px;">QTD UN VL UNIT VL TOTAL</div>`);
  lines.push(`<div>${divider2}</div>`);

  let total = 0;
  items.forEach((item, idx) => {
    const price = parseFloat(randomBetween(item.priceRange[0], item.priceRange[1]).toFixed(2));
    let qty, qtyStr;
    if (item.unit === 'KG') {
      qty = parseFloat(randomBetween(0.25, 4.0).toFixed(3));
      qtyStr = qty.toFixed(3).replace('.', ',');
    } else {
      qty = randomInt(1, 6);
      qtyStr = String(qty);
    }
    const itemTotal = parseFloat((qty * price).toFixed(2));
    total += itemTotal;

    lines.push(`<div>${String(randomInt(100000,9999999))} ${item.name}</div>`);
    lines.push(`<div>${qtyStr} ${item.unit} x ${formatPrice(price)} (${formatPrice(itemTotal)})</div>`);
  });

  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="font-weight:bold; font-size:14px;">TOTAL: R$ ${formatPrice(total)}</div>`);
  lines.push(`<div>${divider2}</div>`);

  const paymentType = pickRandom(['Cartao de Credito', 'Cartao de Debito', 'Dinheiro', 'PIX QR Code']);
  lines.push(`<div>Forma Pgto: ${paymentType}</div>`);
  lines.push(`<div>Valor Pago: R$ ${formatPrice(total)}</div>`);
  lines.push(`<div>${divider2}</div>`);
  lines.push(`<div>Qtde. total de itens: ${items.length}</div>`);
  lines.push(`<div>Valor total: R$ ${formatPrice(total)}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div>EMISSAO: ${date.formatted}</div>`);
  lines.push(`<div>NFC-e: ${randomInt(100000, 999999)} Serie: ${randomInt(1, 99)}</div>`);
  lines.push(`<div>Protocolo: ${randomInt(100000000, 999999999)}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="text-align:center;">Consulte pela Chave de Acesso em:</div>`);
  lines.push(`<div style="text-align:center; font-size:9px;">www.nfce.fazenda.sp.gov.br/consulta</div>`);
  lines.push(`</div>`);

  return lines.join('\n');
}

function generateReceiptFormat3(store, items, date, receiptNum) {
  // Format 3: More detailed, tabular style
  let lines = [];
  const divider = '─'.repeat(46);

  lines.push(`<div class="receipt" style="font-family: 'Courier New', monospace; font-size: 11px; width: 330px; padding: 18px; background: white; color: #111; line-height: 1.5;">`);
  lines.push(`<div style="text-align:center; font-weight:bold; font-size:12px; border-bottom: 2px solid #333; padding-bottom: 8px;">${store.fantasia}</div>`);
  lines.push(`<div style="text-align:center; margin-top:4px;">${store.name}</div>`);
  lines.push(`<div style="text-align:center;">CNPJ ${store.cnpj}</div>`);
  lines.push(`<div style="text-align:center;">IE ${store.ie}</div>`);
  lines.push(`<div style="text-align:center; font-size:10px;">${store.address}</div>`);
  lines.push(`<div style="text-align:center; font-size:10px;">${store.city} - ${store.cep}</div>`);
  lines.push(`<div style="margin: 6px 0;">${divider}</div>`);
  lines.push(`<div style="text-align:center;">CUPOM FISCAL</div>`);
  lines.push(`<div style="text-align:center;">Data: ${date.formatted}</div>`);
  lines.push(`<div style="text-align:center;">CCF: ${String(receiptNum).padStart(6,'0')} COO: ${String(randomInt(100000,999999))}</div>`);
  lines.push(`<div style="margin: 6px 0;">${divider}</div>`);
  lines.push(`<div>ITEM CODIGO DESCRICAO</div>`);
  lines.push(`<div>     QTD.   x  PRECO UN.    VALOR (R$)</div>`);
  lines.push(`<div style="margin: 4px 0;">${divider}</div>`);

  let total = 0;
  let totalDiscount = 0;
  items.forEach((item, idx) => {
    const price = parseFloat(randomBetween(item.priceRange[0], item.priceRange[1]).toFixed(2));
    let qty, qtyStr;
    if (item.unit === 'KG') {
      qty = parseFloat(randomBetween(0.2, 3.0).toFixed(3));
      qtyStr = qty.toFixed(3).replace('.', ',');
    } else {
      qty = randomInt(1, 10);
      qtyStr = String(qty) + ',000';
    }
    const itemTotal = parseFloat((qty * price).toFixed(2));
    total += itemTotal;

    // Some items have discount
    let discount = 0;
    if (Math.random() > 0.8) {
      discount = parseFloat((itemTotal * randomBetween(0.05, 0.15)).toFixed(2));
      totalDiscount += discount;
    }

    const num = String(idx + 1).padStart(3, '0');
    const code = String(randomInt(10000000, 99999999));
    lines.push(`<div>${num}  ${code} ${item.name}</div>`);
    lines.push(`<div>     ${qtyStr} ${item.unit} x ${formatPrice(price)}     ${formatPrice(itemTotal)}</div>`);
    if (discount > 0) {
      lines.push(`<div style="color:#666;">     DESC. PROMOCAO            -${formatPrice(discount)}</div>`);
    }
  });

  const finalTotal = total - totalDiscount;
  lines.push(`<div style="margin: 6px 0;">${divider}</div>`);
  lines.push(`<div>SUBTOTAL                    R$ ${formatPrice(total)}</div>`);
  if (totalDiscount > 0) {
    lines.push(`<div>DESCONTO                   -R$ ${formatPrice(totalDiscount)}</div>`);
  }
  lines.push(`<div style="font-weight:bold; font-size:14px;">TOTAL                       R$ ${formatPrice(finalTotal)}</div>`);
  lines.push(`<div style="margin: 6px 0;">${divider}</div>`);

  const paymentType = pickRandom(['CREDITO VISA', 'DEBITO MASTERCARD', 'DINHEIRO', 'PIX']);
  lines.push(`<div>FORMA PAGAMENTO:  ${paymentType}</div>`);
  lines.push(`<div>VALOR PAGO:       R$ ${formatPrice(finalTotal)}</div>`);
  lines.push(`<div style="margin: 6px 0;">${divider}</div>`);
  lines.push(`<div>TOTAL DE ITENS: ${items.length}</div>`);
  lines.push(`<div>${divider}</div>`);
  lines.push(`<div style="text-align:center; font-size:9px; margin-top:8px;">OBRIGADO PELA PREFERENCIA</div>`);
  lines.push(`<div style="text-align:center; font-size:9px;">VOLTE SEMPRE!</div>`);
  lines.push(`</div>`);

  return lines.join('\n');
}

// =============================================
// MAIN GENERATOR
// =============================================

async function generateReceipts() {
  console.log('🚀 Iniciando geração de cupons fiscais...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const outputDir = path.join(__dirname);
  const receipts = [];

  // Generate 15 receipts
  for (let i = 1; i <= 15; i++) {
    const store = STORES[i % STORES.length];
    const itemCount = randomInt(5, 25);
    const products = pickRandomProducts(itemCount);
    const date = randomDate();
    const receiptNum = randomInt(100000, 999999);

    // Alternate between formats
    let html;
    const format = (i % 3) + 1;
    if (format === 1) {
      html = generateReceiptFormat1(store, products, date, receiptNum);
    } else if (format === 2) {
      html = generateReceiptFormat2(store, products, date, receiptNum);
    } else {
      html = generateReceiptFormat3(store, products, date, receiptNum);
    }

    // Full HTML page
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; display: flex; justify-content: center; }
    .receipt { box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  </style>
</head>
<body>${html}</body>
</html>`;

    // Generate PNG image
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    // Get the receipt element's dimensions
    const receiptEl = await page.$('.receipt');
    const box = await receiptEl.boundingBox();

    const fileName = `cupom_${String(i).padStart(2, '0')}_${store.fantasia.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.png`;
    const filePath = path.join(outputDir, fileName);

    await receiptEl.screenshot({
      path: filePath,
      type: 'png',
    });

    console.log(`✅ [${i}/15] ${fileName} (${itemCount} itens, formato ${format})`);
    receipts.push({ fileName, store: store.fantasia, items: itemCount, format });

    await page.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('🎉 CONCLUÍDO! 15 cupons gerados na pasta:');
  console.log(`   ${outputDir}`);
  console.log('='.repeat(50));
  console.log('\n📋 Resumo:');
  receipts.forEach(r => {
    console.log(`   📄 ${r.fileName}`);
    console.log(`      Loja: ${r.store} | ${r.items} itens | Formato ${r.format}`);
  });
  console.log('\n📌 Próximos passos:');
  console.log('   1. Acesse https://extractlab.com.br/Model/Create');
  console.log('   2. Nome do Modelo: "Cupom Mercado"');
  console.log('   3. Faça upload dos 15 arquivos .png gerados');
  console.log('   4. Marque os campos em cada documento');
  console.log('   5. Treine o modelo!');
}

generateReceipts().catch(console.error);
