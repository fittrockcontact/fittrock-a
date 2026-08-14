'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { isAdminEmail } from '@/lib/constants/admins';
import { ShieldAlert, Lock, Mail, Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithEmail, signInWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    const handleEmailSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setSubmitting(true);
      try {
        await signInWithEmail(email, password);
        toast.success('Admin identity verified');
      } catch (err: any) {
        console.error('Admin Sign In error:', err);
        setAuthError(err.message || 'Invalid administrator credentials');
      } finally {
        setSubmitting(false);
      }
    };

    const handleGoogleSignIn = async () => {
      setAuthError('');
      setSubmitting(true);
      try {
        await signInWithGoogle();
        toast.success('Admin identity verified with Google');
      } catch (err: any) {
        console.error('Google sign-in error:', err);
        if (err.code !== 'auth/popup-closed-by-user') {
          setAuthError(err.message || 'Google authentication failed');
        }
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              FITT<span className="text-amber-500">ROCK</span> Admin Control
            </h1>
            <p className="text-xs text-zinc-400">
              Restricted to authorized system administrators only.
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/50 border border-red-800/60 text-red-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-sm disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Or with admin credentials
            </span>
            <div className="border-t border-zinc-800 w-full" />
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fittrock.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Access Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-red-900/50 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Access Denied</h1>
            <p className="text-sm text-zinc-400">
              Your signed-in account is not authorized to access the Fittrock Administrator Dashboard.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Current Account
            </span>
            <p className="text-sm font-mono font-bold text-zinc-200 break-all">{user.email}</p>
            <p className="text-[11px] text-red-400 font-semibold mt-1">Status: Unauthorized Role</p>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign In with Authorized Account</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
