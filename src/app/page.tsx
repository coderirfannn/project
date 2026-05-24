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
    <div className="mx-auto max-w-3xl space-y-5 py-12">
      <Card className="overflow-hidden border-slate-200/80 bg-white/92 backdrop-blur-xl">
        <CardHeader>
          <p className="section-eyebrow text-emerald-600">System status</p>
          <CardTitle className="text-2xl sm:text-[2rem]">Dashboard unavailable</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            The application cannot reach MongoDB Atlas or the required environment variables are missing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="shadow-none">Failed to load dashboard data from MongoDB.</Alert>
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Check that <span className="font-mono text-slate-900">MONGODB_URI</span> is correct, that your Atlas network access allows this machine, and then refresh the page.
          </div>
          <RetryButton />
        </CardContent>
      </Card>
    </div>
  );
}
