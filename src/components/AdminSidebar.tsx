'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Star,
  Users,
  ExternalLink,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/products/new', label: 'Add Product', icon: PlusCircle },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/reviews', label: 'Reviews & Stories', icon: Star },
  { href: '/customers', label: 'Customers', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 text-zinc-300 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-zinc-950 text-lg">
            F
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              FITT<span className="text-amber-500">ROCK</span>
            </span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
              Admin
            </span>
          </div>
        </Link>
        <p className="text-[11px] text-zinc-500 mt-2">
          admin.fittrock.com • Control Center
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Quick Store Link */}
      <div className="p-4 border-t border-zinc-800/80 space-y-3">
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 bg-zinc-900/80 hover:bg-zinc-800 hover:text-amber-400 border border-zinc-800 transition-all"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Storefront</span>
          </span>
          <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
            fittrock.com
          </span>
        </a>

        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Live</span>
          </span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
