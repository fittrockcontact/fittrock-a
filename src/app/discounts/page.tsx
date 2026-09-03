import React from 'react';
import { DiscountsClient, DiscountItem } from './DiscountsClient';
import { apiFetch } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function AdminDiscountsPage() {
  let discountsList: DiscountItem[] = [];

  try {
    const res = await apiFetch<{ discounts: DiscountItem[] }>('/api/admin/discounts');
    if (Array.isArray(res.discounts)) {
      discountsList = res.discounts;
    }
  } catch (err) {
    console.error('Failed to fetch discounts:', err);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Discounts &amp; Promotional Codes
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage percentage discounts, cash vouchers, and seasonal promotional coupons.
        </p>
      </div>

      <DiscountsClient initialDiscounts={discountsList} />
    </div>
  );
}
