import { format, startOfWeek, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function formatDateLong(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

export function getMonthRange(date: Date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function daysBetween(date1: string, date2: string): number {
  return differenceInDays(parseISO(date2), parseISO(date1));
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function parseNumber(str: string): number {
  if (!str) return 0;
  // Handle Brazilian number format: 1.234,56 -> 1234.56
  const cleaned = str
    .replace(/[^\d.,\-]/g, '')
    .replace(/\.(?=.*[.,])/g, '')  // remove dots before last separator
    .replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export async function compressImage(file: File, maxSizeMB = 1, maxWidthOrHeight = 1920): Promise<File> {
  const imageCompression = (await import('browser-image-compression')).default;
  return imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    un: 'unidade(s)',
    kg: 'kg',
    g: 'g',
    l: 'litro(s)',
    ml: 'ml',
    pct: 'pacote(s)',
    cx: 'caixa(s)',
    dz: 'dúzia(s)',
  };
  return labels[unit] || unit;
}

export function getUnitAbbr(unit: string): string {
  const abbrs: Record<string, string> = {
    un: 'un',
    kg: 'kg',
    g: 'g',
    l: 'L',
    ml: 'ml',
    pct: 'pct',
    cx: 'cx',
    dz: 'dz',
  };
  return abbrs[unit] || unit;
}
