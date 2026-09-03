'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

export interface DiscountItem {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimitTotal?: number | null;
  usageLimitPerUser?: number | null;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt?: string;
}

interface Props {
  initialDiscounts: DiscountItem[];
}

export function DiscountsClient({ initialDiscounts }: Props) {
  const [discounts, setDiscounts] = useState<DiscountItem[]>(initialDiscounts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: '10',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimitTotal: '',
    isActive: true,
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    const valNum = parseFloat(form.value);
    if (isNaN(valNum) || valNum <= 0) {
      toast.error('Please enter a valid positive discount value');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/discounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          description: form.description,
          type: form.type,
          value: valNum,
          minOrderAmount: parseFloat(form.minOrderAmount || '0'),
          maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
          usageLimitTotal: form.usageLimitTotal ? parseInt(form.usageLimitTotal) : null,
          isActive: form.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create discount');
      }

      toast.success(`Coupon code ${form.code.toUpperCase()} created successfully!`);

      // Refresh list
      const listRes = await fetch(`${apiUrl}/api/admin/discounts`);
      const listData = await listRes.json();
      if (Array.isArray(listData.discounts)) {
        setDiscounts(listData.discounts);
      }

      setShowCreateModal(false);
      setForm({
        code: '',
        description: '',
        type: 'percentage',
        value: '10',
        minOrderAmount: '0',
        maxDiscountAmount: '',
        usageLimitTotal: '',
        isActive: true,
      });
    } catch (err: any) {
      toast.error(err.message || 'Error creating discount code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) throw new Error('Failed to toggle discount status');

      setDiscounts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, isActive: !currentStatus } : d))
      );

      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${apiUrl}/api/admin/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete coupon');

      setDiscounts((prev) => prev.filter((d) => d.id !== id));
      toast.success(`Coupon "${code}" deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting discount code');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" />
            <span>Active Promotions ({discounts.filter((d) => d.isActive).length})</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Create promotional coupon codes for checkout campaigns and email subscriber discounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Discounts Grid / Table */}
      {discounts.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-16 text-center space-y-3">
          <Tag className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No promotional discounts yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Create your first promo code like WELCOME10 or FREESHIP to boost desk conversions.
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Coupon</span>
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Code</th>
                  <th className="py-3.5 px-4 font-bold">Discount Value</th>
                  <th className="py-3.5 px-4 font-bold">Conditions</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-black text-amber-400 text-sm tracking-wider">
                          {d.code}
                        </span>
                        {d.description && (
                          <p className="text-xs text-zinc-400">{d.description}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-white text-xs inline-flex items-center gap-1">
                        {d.type === 'percentage' ? (
                          <>
                            <span>{d.value}% OFF</span>
                            <Percent className="w-3 h-3 text-amber-500" />
                          </>
                        ) : (
                          <>
                            <span>₹{d.value} OFF</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-zinc-400 space-y-0.5">
                      {d.minOrderAmount > 0 ? (
                        <p>Min order: ₹{d.minOrderAmount.toLocaleString()}</p>
                      ) : (
                        <p>No minimum spend</p>
                      )}
                      {d.maxDiscountAmount && d.maxDiscountAmount > 0 && (
                        <p className="text-[11px] text-zinc-500">Max cap: ₹{d.maxDiscountAmount}</p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(d.id, d.isActive)}
                        disabled={togglingId === d.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          d.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {togglingId === d.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : d.isActive ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{d.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(d.id, d.code)}
                        disabled={deletingId === d.id}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Delete Coupon"
                      >
                        {deletingId === d.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">Create New Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-white p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE15"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold uppercase tracking-wider focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Campaign Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. 15% off during Diwali Desk Upgrade Sale"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as 'percentage' | 'fixed_amount' })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed_amount">Flat Amount Off (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder={form.type === 'percentage' ? '15' : '1500'}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Min Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    placeholder="Optional max cap"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-zinc-800"
                  />
                  <span>Activate immediately</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Coupon</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
