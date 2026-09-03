'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Mail,
  Phone,
  ShoppingBag,
  Building2,
  MapPin,
  Search,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export interface CustomerAddress {
  id: string;
  user_id: string;
  type: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber?: string;
  order_number?: string;
  totalAmount?: string;
  total_amount?: string;
  status: string;
  placedAt?: string;
  placed_at?: string;
}

export interface CustomerItem {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string | null;
  isBusiness?: boolean;
  gstNumber?: string | null;
  businessName?: string | null;
  marketingOptIn?: boolean;
  ordersCount: number;
  totalSpent: string;
  orders?: CustomerOrder[];
  addresses?: CustomerAddress[];
  createdAt: string;
  updatedAt?: string | null;
}

interface CustomersClientProps {
  initialCustomers: CustomerItem[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'business' | 'individual' | 'with_orders'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return initialCustomers.filter((cust) => {
      const matchesSearch =
        cust.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust.phone && cust.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cust.businessName && cust.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cust.gstNumber && cust.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cust.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'business') return !!cust.isBusiness;
      if (filterType === 'individual') return !cust.isBusiness;
      if (filterType === 'with_orders') return cust.ordersCount > 0;

      return true;
    });
  }, [initialCustomers, searchTerm, filterType]);

  // Aggregate Metrics
  const totalCustomersCount = initialCustomers.length;
  const b2bCount = initialCustomers.filter((c) => c.isBusiness).length;
  const activeBuyersCount = initialCustomers.filter((c) => c.ordersCount > 0).length;
  const totalLifetimeSpent = initialCustomers.reduce(
    (sum, c) => sum + (parseFloat(c.totalSpent) || 0),
    0
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Customer Directory & Profiles</span>
            <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2.5 py-1 rounded-full border border-amber-500/20">
              Live Database
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Registered customer accounts, verified B2B company GST profiles, delivery addresses, and lifetime purchase history.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Users className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{totalCustomersCount}</p>
          <p className="text-xs text-zinc-500">Registered Supabase profiles</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              B2B Business Accounts
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{b2bCount}</p>
          <p className="text-xs text-zinc-500">Corporate & GST invoices</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Buyers
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{activeBuyersCount}</p>
          <p className="text-xs text-zinc-500">Completed order checkouts</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Customer LTV
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{formatPrice(totalLifetimeSpent)}</p>
          <p className="text-xs text-zinc-500">Cumulative spend across desks</p>
        </div>
      </div>

      {/* Directory Search & Filter Controls */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, company, or GST..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              All Profiles ({totalCustomersCount})
            </button>
            <button
              onClick={() => setFilterType('business')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterType === 'business'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/10'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business B2B ({b2bCount})</span>
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === 'individual'
                  ? 'bg-zinc-200 text-zinc-950'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Individuals ({totalCustomersCount - b2bCount})
            </button>
            <button
              onClick={() => setFilterType('with_orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === 'with_orders'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/10'
                  : 'bg-zinc-800/70 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Has Orders ({activeBuyersCount})
            </button>
          </div>
        </div>

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 space-y-3 text-zinc-500">
            <Users className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-base font-bold text-zinc-300">No matching customer profiles found</p>
            <p className="text-xs">Try adjusting your search criteria or filter tags.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-xs font-semibold text-amber-400 hover:underline"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/60 border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">Delivery Addresses</th>
                  <th className="py-3 px-4">Orders & Spend</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredCustomers.map((cust) => {
                  const displayName = cust.fullName || cust.email.split('@')[0] || 'Customer';
                  const initials = displayName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'C';

                  const defaultAddress = cust.addresses?.find((a) => a.is_default) || cust.addresses?.[0];

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Customer Avatar & Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {cust.avatarUrl ? (
                            <img
                              src={cust.avatarUrl}
                              alt={displayName}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                                {displayName}
                              </p>
                              {cust.isBusiness && (
                                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/20">
                                  B2B
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              ID: {cust.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                          <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[180px]">{cust.email || 'No email registered'}</span>
                        </div>
                        {cust.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Phone className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                            <span>{cust.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-zinc-600">No phone provided</span>
                        )}
                      </td>

                      {/* Account Type / Business Info */}
                      <td className="py-4 px-4">
                        {cust.isBusiness ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs font-semibold text-purple-400">
                              <Building2 className="w-3 h-3" />
                              <span>{cust.businessName || 'Business Profile'}</span>
                            </div>
                            {cust.gstNumber && (
                              <p className="text-[11px] font-mono text-zinc-400">
                                GSTIN: {cust.gstNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                            Individual / Personal
                          </span>
                        )}
                      </td>

                      {/* Saved Addresses */}
                      <td className="py-4 px-4">
                        {defaultAddress ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-zinc-300">
                              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate max-w-[160px]">
                                {defaultAddress.city}, {defaultAddress.state}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              {cust.addresses?.length || 1} saved address
                              {(cust.addresses?.length || 1) > 1 ? 'es' : ''}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">No saved address</span>
                        )}
                      </td>

                      {/* Orders Count & Total Spend */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-white">
                            {formatPrice(cust.totalSpent)}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                            <ShoppingBag className="w-3 h-3 text-amber-400" />
                            <span>{cust.ordersCount} orders</span>
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-xs text-zinc-400">
                        {formatDate(cust.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                          className="inline-flex items-center gap-1.5 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile Slide-over / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-start justify-between bg-zinc-950/60">
              <div className="flex items-center gap-4">
                {selectedCustomer.avatarUrl ? (
                  <img
                    src={selectedCustomer.avatarUrl}
                    alt={selectedCustomer.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/40 shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-lg">
                    {selectedCustomer.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || 'C'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {selectedCustomer.fullName}
                    </h2>
                    {selectedCustomer.isBusiness ? (
                      <span className="bg-purple-500/10 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full border border-purple-500/20">
                        B2B Business Account
                      </span>
                    ) : (
                      <span className="bg-zinc-800 text-zinc-300 text-xs font-medium px-2 py-0.5 rounded-full">
                        Individual Account
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-zinc-400 font-mono">
                      UID: {selectedCustomer.id}
                    </p>
                    <button
                      onClick={() => handleCopy(selectedCustomer.id, 'Customer UID')}
                      className="text-zinc-500 hover:text-amber-400 transition-colors"
                      title="Copy customer UID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
              {/* Quick Communication & Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCustomer.email && (
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-950 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-500">Email Address</p>
                        <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {selectedCustomer.email}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-amber-400" />
                  </a>
                )}

                {selectedCustomer.phone && (
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-950 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-500">Phone Number</p>
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {selectedCustomer.phone}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                  </a>
                )}
              </div>

              {/* Lifetime Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 text-center space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Lifetime Spend
                  </p>
                  <p className="text-lg font-black text-amber-400">
                    {formatPrice(selectedCustomer.totalSpent)}
                  </p>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 text-center space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Total Orders
                  </p>
                  <p className="text-lg font-black text-white">
                    {selectedCustomer.ordersCount}
                  </p>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 text-center space-y-1">
                  <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                    Member Since
                  </p>
                  <p className="text-xs font-bold text-zinc-300 mt-1">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
              </div>

              {/* Business Account Details (If B2B) */}
              {selectedCustomer.isBusiness && (
                <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>Business & Corporate Invoice Profile</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-zinc-400">Company / Business Name</p>
                      <p className="font-bold text-white mt-0.5">
                        {selectedCustomer.businessName || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-400">Registered GSTIN Number</p>
                      <p className="font-mono font-bold text-amber-400 mt-0.5">
                        {selectedCustomer.gstNumber || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Delivery Addresses */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Saved Addresses ({selectedCustomer.addresses?.length || 0})</span>
                </h3>

                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-center text-xs text-zinc-500">
                    No delivery address saved in profile yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedCustomer.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            {addr.full_name}
                          </span>
                          {addr.is_default && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full">
                              Default Shipping
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}
                          <br />
                          {addr.city}, {addr.state} - {addr.postal_code}
                          <br />
                          {addr.country}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Phone: {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Purchase History ({selectedCustomer.orders?.length || 0})</span>
                </h3>

                {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-center text-xs text-zinc-500">
                    No orders placed by this customer yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-amber-400">
                            {ord.order_number || ord.orderNumber || ord.id.slice(0, 8)}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Placed on {formatDate(ord.placed_at || ord.placedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">
                            {formatPrice(ord.total_amount || ord.totalAmount || '0')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ['paid', 'shipped', 'delivered'].includes(ord.status)
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Supabase Customer Data Sync</span>
              </span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
