import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardDataOrNull } from '@/services/dashboard.service';
import { InventoryReservationDashboard } from '@/components/dashboard/inventory-reservation-dashboard';
import { RetryButton } from '@/components/shared/retry-button';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function HomePage() {
  const dashboard = await getDashboardDataOrNull();

  if (dashboard) {
    return <InventoryReservationDashboard initialDashboard={dashboard} />;
  }

  return (
    <div className="mx-auto max-w-4xl py-6">
      <Card className="surface-panel-dark mx-auto max-w-2xl text-white">
        <CardHeader>
          <p className="section-eyebrow text-slate-400">System status</p>
          <CardTitle className="font-display text-[1.35rem] tracking-[-0.03em] text-white sm:text-[1.7rem]">Dashboard unavailable</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7 text-slate-400">
            The application cannot reach MongoDB Atlas or the required environment variables are missing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">Failed to load dashboard data from MongoDB.</Alert>
          <div className="rounded-[0.95rem] border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
            Check that <span className="font-mono text-white">MONGODB_URI</span> is correct, that your Atlas network access allows this machine, and then refresh the page.
          </div>
          <RetryButton />
        </CardContent>
      </Card>
    </div>
  );
}
