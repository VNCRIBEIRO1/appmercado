import type { OCRExtractedItem, OCRResult, ItemUnit } from './types';
import { parseNumber } from './utils';
import { autoCategorizeName } from './categories';

// =============================================
// RECEIPT PARSER - Brazilian Cupom Fiscal
// =============================================

interface ExtractLabField {
  name: string;
  value: string;
  confidence: number;
}

interface ExtractLabResponse {
  success?: boolean;
  documentId?: number;
  fileName?: string;
  processedAt?: string;
  fields?: ExtractLabField[];
}

/**
 * Parse the ExtractLab API response into structured receipt data
 */
export function parseOCRResponse(response: ExtractLabResponse): OCRResult {
  const fields = response.fields || [];
  const result: OCRResult = {
    store: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: 0,
    items: [],
    rawFields: fields,
  };

  // Try to extract known fields
  for (const field of fields) {
    const nameLower = field.name.toLowerCase();

    // Store name
    if (nameLower.includes('razao') || nameLower.includes('razão') ||
        nameLower.includes('nome_fantasia') || nameLower.includes('fantasia') ||
        nameLower.includes('emitente') || nameLower.includes('estabelecimento') ||
        nameLower.includes('loja') || nameLower.includes('store')) {
      result.store = field.value.trim();
    }

    // Date
    if (nameLower.includes('data') || nameLower.includes('emissao') || nameLower.includes('emissão')) {
      const parsed = parseDate(field.value);
      if (parsed) result.date = parsed;
    }

    // Total amount
    if (nameLower.includes('total') || nameLower.includes('valor_total') ||
        nameLower.includes('total_nota') || nameLower.includes('valor_pagar')) {
      result.totalAmount = parseNumber(field.value);
    }

    // Items (might come as a structured field or raw text)
    if (nameLower.includes('item') || nameLower.includes('produto') ||
        nameLower.includes('descricao') || nameLower.includes('descrição')) {
      // Try to parse items from a text block
      const parsedItems = parseItemsFromText(field.value);
      result.items.push(...parsedItems);
    }
  }

  // If no items were found from structured fields, try parsing all text content
  if (result.items.length === 0) {
    const allText = fields.map(f => f.value).join('\n');
    result.items = parseItemsFromText(allText);
  }

  // If we found items but no total, calculate from items
  if (result.totalAmount === 0 && result.items.length > 0) {
    result.totalAmount = result.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  return result;
}

/**
 * Parse items from raw receipt text
 * Brazilian receipts typically have lines like:
 * ARROZ TIPO 1 5KG        1 UN x 23,90  23,90
 * FEIJAO CARIOCA 1KG      2,500 KG x 8,90  22,25
 */
export function parseItemsFromText(text: string): OCRExtractedItem[] {
  if (!text) return [];

  const items: OCRExtractedItem[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (const line of lines) {
    const item = parseReceiptLine(line);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * Try to parse a single line of a Brazilian receipt
 */
function parseReceiptLine(line: string): OCRExtractedItem | null {
  // Skip header/footer lines
  const skipPatterns = [
    /^(CNPJ|CPF|IE|IM|TOTAL|SUBTOTAL|TROCO|DINHEIRO|CREDITO|DEBITO|CARTAO|VISA|MASTER)/i,
    /^(ITEM|COD|CODIGO|QTD|VL|VALOR|DESC|DESCRICAO)/i,
    /^[-=*_]{3,}/,
    /^(SAT|CFOP|NCM|CST|ICMS|PIS|COFINS)/i,
    /^\d{2}\/\d{2}\/\d{4}/,
    /^(TEL|FAX|END|RUA|AV\.|AVENIDA)/i,
    /CUPOM FISCAL/i,
    /NOTA FISCAL/i,
    /CONSUMER/i,
    /OBRIGADO|VOLTE SEMPRE/i,
  ];

  for (const pattern of skipPatterns) {
    if (pattern.test(line)) return null;
  }

  // Pattern 1: CODE DESCRIPTION QTY UN x UNIT_PRICE TOTAL_PRICE
  // Example: 001 ARROZ TIPO 1 5KG 1 UN X 23,90 23,90
  const pattern1 = /^\d{1,6}\s+(.+?)\s+(\d+[.,]?\d*)\s*(UN|KG|G|L|ML|PCT|CX|DZ|PC|BD|FD|LT|GF|MT|M2|M3)?\s*[xX*]\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})\s*$/i;
  let match = line.match(pattern1);
  if (match) {
    return createItem(match[1], match[2], match[3], match[4], match[5]);
  }

  // Pattern 2: DESCRIPTION QTY x UNIT_PRICE TOTAL_PRICE (no code)
  // Example: LEITE INTEGRAL 1L 6 X 5,49 32,94
  const pattern2 = /^([A-ZÀ-Ú][A-ZÀ-Ú0-9\s./%-]+?)\s+(\d+[.,]?\d*)\s*[xX*]\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})\s*$/i;
  match = line.match(pattern2);
  if (match) {
    return createItem(match[1], match[2], undefined, match[3], match[4]);
  }

  // Pattern 3: DESCRIPTION TOTAL_PRICE (simple format)
  // Example: BANANA PRATA KG 8,90
  const pattern3 = /^([A-ZÀ-Ú][A-ZÀ-Ú0-9\s./%-]+?)\s+(\d+[.,]\d{2})\s*$/i;
  match = line.match(pattern3);
  if (match && match[1].length > 3) {
    return createItem(match[1], '1', undefined, match[2], match[2]);
  }

  // Pattern 4: QTY UN x UNIT_PRICE (line after description)
  // Sometimes receipts split item info across lines
  const pattern4 = /^(\d+[.,]?\d*)\s*(UN|KG|G|L|ML|PCT|CX|DZ|PC)?\s*[xX*]\s*(\d+[.,]\d{2})\s*$/i;
  match = line.match(pattern4);
  if (match) {
    // This is a quantity line, would need to be combined with previous line
    return null;
  }

  return null;
}

function createItem(
  name: string,
  qty: string,
  unit: string | undefined,
  unitPrice: string,
  totalPrice: string
): OCRExtractedItem {
  const quantity = parseNumber(qty) || 1;
  const parsedUnit = parseUnit(unit);
  const parsedUnitPrice = parseNumber(unitPrice);
  const parsedTotalPrice = parseNumber(totalPrice);

  return {
    name: cleanItemName(name),
    quantity,
    unit: parsedUnit,
    unitPrice: parsedUnitPrice,
    totalPrice: parsedTotalPrice || parsedUnitPrice * quantity,
    confidence: 0.8,
  };
}

function cleanItemName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\d+\s+/, '')  // Remove leading numbers
    .replace(/\s*[-_]\s*$/, '')  // Remove trailing dashes
    .substring(0, 100);
}

function parseUnit(unit: string | undefined): ItemUnit {
  if (!unit) return 'un';
  const u = unit.toUpperCase();
  const mapping: Record<string, ItemUnit> = {
    'UN': 'un', 'PC': 'un', 'PÇ': 'un',
    'KG': 'kg',
    'G': 'g', 'GR': 'g',
    'L': 'l', 'LT': 'l',
    'ML': 'ml',
    'PCT': 'pct', 'FD': 'pct', 'BD': 'pct', 'PT': 'pct',
    'CX': 'cx',
    'DZ': 'dz',
  };
  return mapping[u] || 'un';
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;

  // Try DD/MM/YYYY
  let match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  // Try DD-MM-YYYY
  match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }

  // Try YYYY-MM-DD (ISO)
  match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  return null;
}

/**
 * Add auto-categorization to parsed items
 */
export function categorizeItems(items: OCRExtractedItem[]): Array<OCRExtractedItem & { category: string }> {
  return items.map(item => ({
    ...item,
    category: autoCategorizeName(item.name),
  }));
}
