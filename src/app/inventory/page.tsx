import React from 'react';
import { InventoryClient, InventoryVariantItem } from './InventoryClient';
import { apiFetch } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  let inventoryList: InventoryVariantItem[] = [];

  try {
    const res = await apiFetch<{ inventory: InventoryVariantItem[] }>('/api/admin/inventory');
    if (Array.isArray(res.inventory)) {
      inventoryList = res.inventory;
    }
  } catch (err) {
    console.error('Failed to fetch inventory:', err);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Inventory &amp; Stock Control
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Monitor real-time warehouse availability, adjust variant stock levels, and resolve low-stock alerts.
        </p>
      </div>

      <InventoryClient initialInventory={inventoryList} />
    </div>
  );
}
