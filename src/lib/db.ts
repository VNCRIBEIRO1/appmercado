import Dexie, { type EntityTable } from 'dexie';
import type { Purchase, PurchaseItem, ConsumptionRecord, AppSettings } from './types';

// =============================================
// DATABASE - IndexedDB via Dexie.js
// =============================================

class MercadoDatabase extends Dexie {
  purchases!: EntityTable<Purchase, 'id'>;
  purchaseItems!: EntityTable<PurchaseItem, 'id'>;
  consumption!: EntityTable<ConsumptionRecord, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('MercadoAppDB');

    this.version(1).stores({
      purchases: '++id, date, store, type, createdAt',
      purchaseItems: '++id, purchaseId, name, category',
      consumption: '++id, itemName, category, purchaseId, status, purchaseDate, finishedDate',
      settings: '++id, &key',
    });
  }
}

export const db = new MercadoDatabase();

// =============================================
// PURCHASES CRUD
// =============================================

export async function addPurchase(
  purchase: Omit<Purchase, 'id'>,
  items: Omit<PurchaseItem, 'id' | 'purchaseId'>[]
): Promise<number> {
  return db.transaction('rw', db.purchases, db.purchaseItems, async () => {
    const purchaseId = await db.purchases.add(purchase as Purchase);

    const itemsWithPurchaseId = items.map(item => ({
      ...item,
      purchaseId: purchaseId as number,
    }));

    await db.purchaseItems.bulkAdd(itemsWithPurchaseId as PurchaseItem[]);

    return purchaseId as number;
  });
}

export async function getPurchases(): Promise<Purchase[]> {
  return db.purchases.orderBy('date').reverse().toArray();
}

export async function getPurchaseById(id: number): Promise<Purchase | undefined> {
  return db.purchases.get(id);
}

export async function getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
  return db.purchaseItems.where('purchaseId').equals(purchaseId).toArray();
}

export async function deletePurchase(id: number): Promise<void> {
  await db.transaction('rw', db.purchases, db.purchaseItems, db.consumption, async () => {
    await db.purchaseItems.where('purchaseId').equals(id).delete();
    await db.consumption.where('purchaseId').equals(id).delete();
    await db.purchases.delete(id);
  });
}

export async function getPurchasesByDateRange(start: string, end: string): Promise<Purchase[]> {
  return db.purchases
    .where('date')
    .between(start, end, true, true)
    .reverse()
    .toArray();
}

export async function getPurchasesByType(type: 'weekly' | 'monthly'): Promise<Purchase[]> {
  return db.purchases.where('type').equals(type).reverse().sortBy('date');
}

// =============================================
// CONSUMPTION TRACKING
// =============================================

export async function addConsumptionRecords(
  records: Omit<ConsumptionRecord, 'id'>[]
): Promise<void> {
  await db.consumption.bulkAdd(records as ConsumptionRecord[]);
}

export async function getActiveConsumption(): Promise<ConsumptionRecord[]> {
  return db.consumption.where('status').equals('active').toArray();
}

export async function getAllConsumption(): Promise<ConsumptionRecord[]> {
  return db.consumption.orderBy('purchaseDate').reverse().toArray();
}

export async function markItemFinished(
  id: number,
  finishedDate: string
): Promise<void> {
  const record = await db.consumption.get(id);
  if (!record) return;

  const purchaseDate = new Date(record.purchaseDate);
  const finished = new Date(finishedDate);
  const durationDays = Math.ceil(
    (finished.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  await db.consumption.update(id, {
    status: 'finished',
    finishedDate,
    durationDays: Math.max(1, durationDays),
  });
}

export async function markItemWasted(id: number): Promise<void> {
  await db.consumption.update(id, {
    status: 'wasted',
    finishedDate: new Date().toISOString().split('T')[0],
  });
}

export async function getAverageDuration(itemName: string): Promise<number | null> {
  const records = await db.consumption
    .where('itemName')
    .equalsIgnoreCase(itemName)
    .and(r => r.status === 'finished' && r.durationDays != null)
    .toArray();

  if (records.length === 0) return null;

  const totalDays = records.reduce((sum, r) => sum + (r.durationDays || 0), 0);
  return Math.round(totalDays / records.length);
}

export async function getConsumptionHistory(itemName: string): Promise<ConsumptionRecord[]> {
  return db.consumption
    .where('itemName')
    .equalsIgnoreCase(itemName)
    .reverse()
    .sortBy('purchaseDate');
}

// =============================================
// ANALYTICS QUERIES
// =============================================

export async function getTotalSpentInRange(start: string, end: string): Promise<number> {
  const purchases = await getPurchasesByDateRange(start, end);
  return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
}

export async function getCategorySpending(start: string, end: string): Promise<Record<string, number>> {
  const purchases = await getPurchasesByDateRange(start, end);
  const purchaseIds = purchases.map(p => p.id!);

  const items = await db.purchaseItems
    .where('purchaseId')
    .anyOf(purchaseIds)
    .toArray();

  const spending: Record<string, number> = {};
  for (const item of items) {
    spending[item.category] = (spending[item.category] || 0) + item.totalPrice;
  }
  return spending;
}

export async function getTopItems(start: string, end: string, limit = 10): Promise<Array<{ name: string; totalSpent: number; count: number }>> {
  const purchases = await getPurchasesByDateRange(start, end);
  const purchaseIds = purchases.map(p => p.id!);

  const items = await db.purchaseItems
    .where('purchaseId')
    .anyOf(purchaseIds)
    .toArray();

  const itemMap: Record<string, { totalSpent: number; count: number }> = {};
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (!itemMap[key]) {
      itemMap[key] = { totalSpent: 0, count: 0 };
    }
    itemMap[key].totalSpent += item.totalPrice;
    itemMap[key].count += 1;
  }

  return Object.entries(itemMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export async function getAllItems(): Promise<PurchaseItem[]> {
  return db.purchaseItems.toArray();
}

// =============================================
// SETTINGS
// =============================================

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.settings.where('key').equals(key).first();
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing) {
    await db.settings.update(existing.id!, { value });
  } else {
    await db.settings.add({ key, value } as AppSettings);
  }
}

// =============================================
// EXPORT DATA
// =============================================

export async function exportAllData(): Promise<string> {
  const purchases = await db.purchases.toArray();
  const items = await db.purchaseItems.toArray();
  const consumption = await db.consumption.toArray();
  const settings = await db.settings.toArray();

  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    purchases,
    purchaseItems: items,
    consumption,
    settings,
  }, null, 2);
}

export async function importData(jsonStr: string): Promise<void> {
  const data = JSON.parse(jsonStr);

  await db.transaction('rw', db.purchases, db.purchaseItems, db.consumption, db.settings, async () => {
    await db.purchases.clear();
    await db.purchaseItems.clear();
    await db.consumption.clear();
    await db.settings.clear();

    if (data.purchases) await db.purchases.bulkAdd(data.purchases);
    if (data.purchaseItems) await db.purchaseItems.bulkAdd(data.purchaseItems);
    if (data.consumption) await db.consumption.bulkAdd(data.consumption);
    if (data.settings) await db.settings.bulkAdd(data.settings);
  });
}
