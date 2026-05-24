import type { Metadata } from 'next';
import Link from 'next/link';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import type { ReactNode } from 'react';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import './globals.css';
import { cn } from '@/lib/utils';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'Inventory Reservation System',
  description: 'Concurrency-safe inventory reservations with MongoDB and Next.js 15.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Inventory Reservation System';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(manrope.variable, ibmPlexMono.variable, 'antialiased font-sans')}>
        <ReactQueryProvider>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(135deg,transparent,rgba(15,23,42,0.05),transparent)]" />
            <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
              <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-soft backdrop-blur-xl">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
                    Production inventory control
                  </p>
                  <h1 className="mt-1 text-lg font-semibold text-slate-950">{appName}</h1>
                </div>
                <nav className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/products"
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
                  >
                    Products
                  </Link>
                  <Link
                    href="/"
                    className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 sm:inline-flex"
                  >
                    Dashboard
                  </Link>
                </nav>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
