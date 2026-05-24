"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Command, LayoutDashboard, Package, RefreshCcw, ShieldCheck, SquareTerminal } from 'lucide-react';

const navigation = [
  { href: '/', label: 'Overview', description: 'Operational status', icon: LayoutDashboard },
  { href: '/products', label: 'Catalog', description: 'Reserve inventory', icon: Package },
] as const;

export function WorkspaceShell({ appName, children }: { appName: string; children: ReactNode }) {
  const pathname = usePathname();
  const routeLabel = pathname === '/products' ? 'Catalog' : pathname?.startsWith('/checkout') ? 'Checkout' : 'Overview';

  return (
    <div className="app-shell relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_20%_0%,rgba(148,163,184,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.12),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[24rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.34),transparent_30%,rgba(15,23,42,0.08),transparent_70%)]" />

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/[0.08] bg-slate-950/92 px-4 py-4 shadow-[0_24px_80px_rgba(2,6,23,0.5)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.04] px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-950">IR</div>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace</p>
            <p className="truncate text-sm font-semibold text-white">{appName}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {navigation.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-[0.9rem] border px-3 py-3 transition-all duration-200',
                  active
                    ? 'border-white/10 bg-white text-slate-950 shadow-[0_16px_40px_rgba(255,255,255,0.06)]'
                    : 'border-transparent bg-transparent text-slate-300 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-slate-950' : 'text-slate-400 group-hover:text-white')} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{item.label}</span>
                    {active ? <Badge variant="outline" className="border-slate-200 bg-slate-900 text-slate-200">Live</Badge> : null}
                  </div>
                  <p className={cn('mt-0.5 text-xs leading-5', active ? 'text-slate-600' : 'text-slate-500')}>{item.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 space-y-4 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Runtime</p>
              <p className="mt-1 text-sm font-medium text-white">Operational</p>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <Separator className="bg-white/10" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Mode</p>
              <p className="mt-1 font-medium text-white">Production</p>
            </div>
            <div>
              <p className="text-slate-500">Latency</p>
              <p className="mt-1 font-medium text-white">Fast</p>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-3 pt-4">
          <Button variant="outline" className="w-full justify-start border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]" onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh workspace
          </Button>
          <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.03] p-4 text-xs leading-6 text-slate-400">
            <p className="font-medium text-slate-200">Command line</p>
            <p className="mt-2 font-mono text-[0.72rem] leading-5 text-slate-400">npm run dev</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-slate-950/[0.82] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] border border-white/10 bg-white/[0.04] text-[0.7rem] font-semibold text-white lg:hidden">IR</div>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">Operations console</p>
                <p className="truncate text-sm font-medium text-white">{routeLabel}</p>
              </div>
            </div>

            <div className="hidden min-w-0 flex-[0.9] lg:block">
              <div className="relative">
                <Command className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  readOnly
                  value="Search reservations, SKU, customers"
                  className="h-10 rounded-[0.95rem] border-white/10 bg-white/[0.04] pl-9 text-sm text-slate-300 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden border-white/10 bg-white/[0.04] text-slate-300 sm:inline-flex">
                <SquareTerminal className="mr-2 h-3.5 w-3.5" />
                Live
              </Badge>
              <Link href="/products" className="inline-flex h-9 items-center justify-center rounded-[0.85rem] bg-white px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100">
                New reservation
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  );
}