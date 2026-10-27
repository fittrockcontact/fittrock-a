'use client';

import React from 'react';
import { DiscountsClient, DiscountItem } from './DiscountsClient';
import { useApiData } from '@/lib/use-api-data';

export default function AdminDiscountsPage() {
  const { data, loading } = useApiData<{ discounts: DiscountItem[] }>('/api/admin/discounts');
  const discountsList: DiscountItem[] = Array.isArray(data?.discounts) ? data.discounts : [];

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading…</p>;
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
