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
      <body className={cn(manrope.variable, ibmPlexMono.variable, 'antialiased font-sans bg-background text-foreground')}>
        <ReactQueryProvider>
          <div className="app-shell relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_46%)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[28rem] bg-[linear-gradient(135deg,transparent,rgba(15,23,42,0.035),transparent)]" />
            <div className="mx-auto flex min-h-screen w-full max-w-[88rem] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
              <header className="surface-panel sticky top-4 z-20 mb-8 overflow-hidden rounded-[1.75rem] px-5 py-4 lg:px-6">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/20">
                      IR
                    </div>
                    <div>
                      <p className="section-eyebrow text-emerald-600">Production inventory control</p>
                      <h1 className="mt-1 text-[1.05rem] font-semibold tracking-tight text-slate-950 sm:text-[1.1rem]">{appName}</h1>
                    </div>
                  </div>

                  <nav className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/"
                      className="inline-flex h-10 items-center rounded-full border border-transparent bg-slate-950 px-4 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700"
                    >
                      Products
                    </Link>
                  </nav>
                </div>
              </header>
              <main className="flex-1 pb-8">{children}</main>
            </div>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
