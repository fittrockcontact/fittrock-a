import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export const metadata: Metadata = {
  title: 'Fittrock Admin Dashboard | Product, Sales & Review Analytics',
  description: 'Internal administrative dashboard for Fittrock Ergonomics (admin.fittrock.com).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased flex">
        <AuthProvider>
          <AdminAuthGuard>
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <AdminHeader />
              <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </AdminAuthGuard>
        </AuthProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}

