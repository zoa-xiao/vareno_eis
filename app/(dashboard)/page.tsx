import { DashboardView } from "@/components/dashboard-view";
import { getDashboardSnapshot } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();
  return <DashboardView snapshot={snapshot} />;
}
