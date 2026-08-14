import React from 'react';
import { ShoppingBag, Calendar, User, CreditCard } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatusDropdown } from './OrderStatusDropdown';

export const dynamic = 'force-dynamic';

interface OrderItem {
  id: string;
  order_number?: string;
  orderNumber?: string;
  total_amount?: string;
  totalAmount?: string;
  subtotal?: string;
  status: string;
  placed_at?: string;
  placedAt?: string;
  razorpay_payment_id?: string;
  customers?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  order_items?: Array<{
    id: string;
    product_title?: string;
    productTitle?: string;
    quantity: number;
    unit_price?: string;
  }>;
}

export default async function AdminOrdersPage() {
  let ordersList: OrderItem[] = [];

  try {
    const res = await apiFetch<{ orders: OrderItem[] }>('/api/admin/orders');
    if (Array.isArray(res.orders)) {
      ordersList = res.orders;
    }
  } catch (err) {
    console.error('Failed to fetch admin orders:', err);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Order Management
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Track customer orders, payments, shipments, and delivery lifecycle.
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">All Orders ({ordersList.length})</h2>
            <p className="text-xs text-zinc-400">Real-time orders processed across storefront</p>
          </div>
        </div>

        {ordersList.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-zinc-500">
            <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-base font-bold text-zinc-300">No customer orders recorded yet</p>
            <p className="text-xs">Incoming customer desk checkouts will populate here with live payment status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {ordersList.map((ord) => {
                  const customerName =
                    ord.customers?.first_name || ord.customers?.last_name
                      ? `${ord.customers.first_name || ''} ${ord.customers.last_name || ''}`.trim()
                      : ord.customers?.email || 'Guest Customer';
                  const itemsCount = ord.order_items?.length || 1;
                  const total = ord.total_amount || ord.totalAmount || '0';
                  const dateVal = ord.placed_at || ord.placedAt;

                  return (
                    <tr key={ord.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {ord.order_number || ord.orderNumber || ord.id.slice(0, 8)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white">{customerName}</p>
                            {ord.customers?.email && (
                              <p className="text-[11px] text-zinc-500">{ord.customers.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs text-zinc-300">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>

                      <td className="py-4 px-4 font-bold text-white">
                        {formatPrice(total)}
                      </td>

                      <td className="py-4 px-4 text-xs text-zinc-400">
                        {formatDate(dateVal)}
                      </td>

                      <td className="py-4 px-4">
                        <OrderStatusDropdown
                          orderId={ord.id}
                          initialStatus={ord.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
