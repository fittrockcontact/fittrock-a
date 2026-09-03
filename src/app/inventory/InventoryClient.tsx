'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

export interface InventoryVariantItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productStatus: string;
  sku: string;
  title: string;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  inventoryQuantity: number;
  isDefault: boolean;
  updatedAt?: string;
}

interface Props {
  initialInventory: InventoryVariantItem[];
}

export function InventoryClient({ initialInventory }: Props) {
  const [items, setItems] = useState<InventoryVariantItem[]>(initialInventory);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'in'>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, number>>({});

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleStockChange = (id: string, val: string) => {
    const num = parseInt(val);
    setStockInputs((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSaveStock = async (id: string) => {
    const newQty = stockInputs[id];
    if (newQty === undefined) return;

    setSavingId(id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: newQty }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stockQuantity: newQty, inventoryQuantity: newQty } : item
        )
      );

      // Clean local edit state
      setStockInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      toast.success('Stock quantity updated');
    } catch (err: any) {
      toast.error(err.message || 'Error updating stock');
    } finally {
      setSavingId(null);
    }
  };

  // Filtered List
  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.productTitle.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filter === 'low') return item.stockQuantity > 0 && item.stockQuantity < 5;
    if (filter === 'out') return item.stockQuantity <= 0;
    if (filter === 'in') return item.stockQuantity >= 5;
    return true;
  });

  const lowStockCount = items.filter((i) => i.stockQuantity > 0 && i.stockQuantity < 5).length;
  const outOfStockCount = items.filter((i) => i.stockQuantity <= 0).length;
  const totalUnits = items.reduce((acc, i) => acc + (Number(i.stockQuantity) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Total Units in Stock
            </span>
            <Boxes className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalUnits.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Across {items.length} product variants</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Low Stock Variants
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{lowStockCount}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Under 5 units remaining</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              Out of Stock
            </span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 mt-2">{outOfStockCount}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Requiring immediate restocking</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/80">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, or color..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'in'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            In Stock
          </button>
          <button
            type="button"
            onClick={() => setFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'low'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'out'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-400 hover:text-white bg-zinc-900'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Product &amp; Variant</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">Selling Price</th>
                <th className="py-3.5 px-4 font-bold">Stock Status</th>
                <th className="py-3.5 px-4 font-bold">Adjust Quantity</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                    No variants match your search or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const currentInput =
                    stockInputs[item.id] !== undefined
                      ? stockInputs[item.id]
                      : item.stockQuantity;
                  const isModified = stockInputs[item.id] !== undefined;

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-xs block">
                            {item.productTitle}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {item.title || 'Standard'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs text-amber-400 font-bold">
                        {item.sku}
                      </td>

                      <td className="py-4 px-4 text-xs font-bold text-zinc-300">
                        {formatPrice(item.price)}
                      </td>

                      <td className="py-4 px-4">
                        {item.stockQuantity <= 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>Out of Stock</span>
                          </span>
                        ) : item.stockQuantity < 5 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Low ({item.stockQuantity} left)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>In Stock ({item.stockQuantity})</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentInput}
                            onChange={(e) => handleStockChange(item.id, e.target.value)}
                            className={`w-20 bg-zinc-950 border rounded-lg px-2.5 py-1 text-xs font-bold text-center focus:outline-none ${
                              isModified
                                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                                : 'border-zinc-800 text-white'
                            }`}
                          />
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleSaveStock(item.id)}
                              disabled={savingId === item.id}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                            >
                              {savingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              <span>Save</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/products/${item.productId}/edit`}
                            className="text-xs text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                            title="Edit Product Details"
                          >
                            Edit
                          </Link>
                          {item.productSlug && (
                            <a
                              href={`${storeUrl}/products/${item.productSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-zinc-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                              title="View on Storefront"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
