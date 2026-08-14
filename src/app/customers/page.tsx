import React from 'react';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface CustomerItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  ordersCount: number;
  totalSpent: string;
  createdAt: string;
}

export default async function AdminCustomersPage() {
  let customersList: CustomerItem[] = [];

  try {
    const res = await apiFetch<{ customers: CustomerItem[] }>('/api/admin/customers');
    if (Array.isArray(res.customers)) {
      customersList = res.customers;
    }
  } catch (err) {
    console.error('Failed to fetch admin customers:', err);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Customer Directory & Spend
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Registered customer profiles, cumulative lifetime spend, and purchase history.
        </p>
      </div>

      {/* Customers Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              Customers ({customersList.length})
            </h2>
            <p className="text-xs text-zinc-400">Profiles stored in Supabase `customers`</p>
          </div>
        </div>

        {customersList.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-zinc-500">
            <Users className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-base font-bold text-zinc-300">No customer profiles recorded yet</p>
            <p className="text-xs">Customer accounts created during checkout will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4 rounded-r-xl">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {customersList.map((cust) => {
                  const fullName =
                    cust.firstName || cust.lastName
                      ? `${cust.firstName || ''} ${cust.lastName || ''}`.trim()
                      : 'Verified Customer';

                  return (
                    <tr key={cust.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white">{fullName}</p>
                            <p className="text-[11px] text-zinc-500 font-mono">ID: {cust.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-zinc-300">
                          <Mail className="w-3 h-3 text-zinc-500" />
                          <span>{cust.email}</span>
                        </div>
                        {cust.phone && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Phone className="w-3 h-3 text-zinc-600" />
                            <span>{cust.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-xs font-semibold">
                          <ShoppingBag className="w-3 h-3 text-amber-400" />
                          <span>{cust.ordersCount}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-amber-400">
                        {formatPrice(cust.totalSpent)}
                      </td>

                      <td className="py-4 px-4 text-xs text-zinc-400">
                        {formatDate(cust.createdAt)}
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
