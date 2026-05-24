import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { getDashboardDataOrNull } from '@/services/dashboard.service';
import { InventoryReservationDashboard } from '@/components/dashboard/inventory-reservation-dashboard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function HomePage() {
  const dashboard = await getDashboardDataOrNull();

  if (dashboard) {
    return <InventoryReservationDashboard initialDashboard={dashboard} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 py-12">
      <Card className="border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription>The application cannot reach MongoDB Atlas or the required environment variables are missing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">Failed to load dashboard data from MongoDB.</Alert>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Check that <span className="font-mono text-slate-900">MONGODB_URI</span> is correct, that your Atlas network access allows this machine, and then refresh the page.
          </div>
          <Link href="/" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50">
            Retry
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
