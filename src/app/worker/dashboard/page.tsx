
import { Suspense } from 'react';
import { getDashboardData } from '@/lib/get-dashboard-data';
import { WorkerDashboardClient } from './client';

// All dashboard data fetching logic has been moved to /lib/get-dashboard-data.ts

export default async function WorkerDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return <div className="p-8">Could not load worker data. Please sign in again.</div>
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkerDashboardClient {...data} />
    </Suspense>
  );
}
