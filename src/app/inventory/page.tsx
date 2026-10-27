'use client';

import React from 'react';
import { InventoryClient, InventoryVariantItem } from './InventoryClient';
import { useApiData } from '@/lib/use-api-data';

export default function AdminInventoryPage() {
  const { data, loading } = useApiData<{ inventory: InventoryVariantItem[] }>('/api/admin/inventory');
  const inventoryList: InventoryVariantItem[] = Array.isArray(data?.inventory) ? data.inventory : [];

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading…</p>;
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
