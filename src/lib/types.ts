// =============================================
// TYPES - MercadoApp
// =============================================

export type PurchaseType = 'weekly' | 'monthly';

export type ItemUnit = 'un' | 'kg' | 'g' | 'l' | 'ml' | 'pct' | 'cx' | 'dz';

export interface Purchase {
  id?: number;
  date: string;           // ISO date string
  store: string;
  totalAmount: number;
  type: PurchaseType;
  itemCount: number;
  receiptImage?: string;  // base64
  createdAt: string;
}

export interface PurchaseItem {
  id?: number;
  purchaseId: number;
  name: string;
  category: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  totalPrice: number;
}

export interface ConsumptionRecord {
  id?: number;
  itemName: string;
  category: string;
  purchaseId: number;
  purchaseDate: string;
  quantity: number;
  unit: ItemUnit;
  finishedDate?: string;
  durationDays?: number;
  status: 'active' | 'finished' | 'wasted';
}

export interface AppSettings {
  id?: number;
  key: string;
  value: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface OCRExtractedItem {
  name: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  totalPrice: number;
  confidence: number;
}

export interface OCRResult {
  store: string;
  date: string;
  totalAmount: number;
  items: OCRExtractedItem[];
  rawFields: Array<{ name: string; value: string; confidence: number }>;
}

export interface DashboardStats {
  totalMonth: number;
  totalWeek: number;
  purchaseCount: number;
  avgPerPurchase: number;
  categoryBreakdown: Array<{ category: string; total: number; color: string }>;
  weeklyTrend: Array<{ week: string; total: number }>;
  itemsRunningLow: Array<{
    itemName: string;
    avgDuration: number;
    daysSincePurchase: number;
    urgency: 'ok' | 'warning' | 'critical';
  }>;
}
