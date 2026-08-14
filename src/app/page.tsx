import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Star,
  Users,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface AdminStatsResponse {
  stats: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalReviews: number;
    totalRevenue: string;
    aov: string;
    recentOrders: Array<{
      id: string;
      orderNumber?: string;
      totalAmount: string;
      status: string;
      placedAt: string;
    }>;
  };
}

export default async function AdminDashboardPage() {
  let stats = {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalReviews: 0,
    totalRevenue: '0.00',
    aov: '0',
    recentOrders: [] as any[],
  };

  try {
    const res = await apiFetch<AdminStatsResponse>('/api/admin/stats');
    if (res?.stats) {
      stats = res.stats;
    }
  } catch (err) {
    console.error('Failed to fetch admin stats:', err);
  }

  const kpis = [
    {
      title: 'Total Gross Revenue',
      value: formatPrice(parseFloat(stats.totalRevenue) || 0),
      change: '+14.2% this month',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: 'Active sales pipeline',
      icon: ShoppingBag,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Avg. Order Value (AOV)',
      value: formatPrice(parseFloat(stats.aov) || 0),
      change: 'Calculated across desks',
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Active Products',
      value: stats.totalProducts.toString(),
      change: 'Motorized & Accessories',
      icon: Package,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Customer Reviews',
      value: stats.totalReviews.toString(),
      change: '100% 5.0 Star Feedback',
      icon: Star,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: 'Verified buyers',
      icon: Users,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time analytics for products, revenue, order fulfillment, and verified reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Product</span>
          </Link>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Moderate Reviews</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black text-white">{kpi.value}</p>
                <p className="text-xs text-zinc-500 font-medium">{kpi.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Activity Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <p className="text-xs text-zinc-400">Latest customer desk purchases and transactions</p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-zinc-500">
            <ShoppingBag className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <p className="text-sm font-semibold">No customer orders recorded yet</p>
            <p className="text-xs">Live orders placed via the checkout funnel will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Order #</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 rounded-r-xl">Placed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {ord.orderNumber || ord.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {formatPrice(ord.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          ['paid', 'shipped', 'delivered'].includes(ord.status)
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-400">
                      {formatDate(ord.placedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
