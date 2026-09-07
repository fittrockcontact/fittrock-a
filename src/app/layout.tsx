import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminHeader } from '@/components/AdminHeader';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/lib/firebase/auth-context';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.fittrock.com';

export const metadata: Metadata = {
  metadataBase: new URL(adminUrl),
  title: 'Fittrock Admin Dashboard | Product, Sales & Review Analytics',
  description: 'Internal administrative dashboard for Fittrock Ergonomics (admin.fittrock.com).',
  openGraph: {
    title: 'Fittrock Admin Dashboard',
    description: 'Internal administrative dashboard for Fittrock Ergonomics.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Fittrock Admin Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fittrock Admin Dashboard',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/logo.png', type: 'image/png' },
      { url: '/logo.ico', sizes: 'any' },
    ],
    shortcut: '/logo.ico',
    apple: '/logo.png',
  },
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

