import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { WorkspaceShell } from '@/components/layout/workspace-shell';
import './globals.css';
import { cn } from '@/lib/utils';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Inventory Reservation System',
  description: 'Concurrency-safe inventory reservations with MongoDB and Next.js 15.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Inventory Reservation System';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(geist.variable, geistMono.variable, 'antialiased font-sans bg-background text-foreground')}>
        <ReactQueryProvider>
          <WorkspaceShell appName={appName}>{children}</WorkspaceShell>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
