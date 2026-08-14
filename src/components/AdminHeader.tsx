'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, ExternalLink, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export function AdminHeader() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000';
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Access Verified</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/products/new"
          className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-sm shadow-amber-500/20"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Product</span>
        </Link>

        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Site</span>
        </a>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-400 overflow-hidden">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.displayName || 'Admin'} className="w-full h-full object-cover" />
              ) : (
                (user.displayName?.charAt(0) || user.email?.charAt(0) || 'A').toUpperCase()
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-white truncate max-w-[140px]">{user.displayName || user.email}</p>
              <p className="text-[10px] text-zinc-400 truncate max-w-[140px]">{user.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
