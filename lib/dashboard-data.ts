import { dashboardMetrics, inventoryAlerts, recentSales, salesSeries } from "@/lib/erp-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardSnapshot = {
  source: "demo" | "supabase";
  metrics: typeof dashboardMetrics;
  recentSales: typeof recentSales;
  sales: number[];
  alerts: typeof inventoryAlerts;
  pendingQc: number;
  pendingApprovals: number;
};

const demoSnapshot: DashboardSnapshot = {
  source: "demo",
  metrics: dashboardMetrics,
  recentSales,
  sales: salesSeries.sixMonths,
  alerts: inventoryAlerts,
  pendingQc: 3,
  pendingApprovals: 3,
};

const money = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return demoSnapshot;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const chartStart = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
  const { data: sales } = await supabase
    .from("sales")
    .select("id, customer_name, total, status, created_at")
    .gte("created_at", chartStart)
    .neq("status", "Dibatalkan")
    .order("created_at", { ascending: false })
    .limit(1000);
  const { data: stock } = await supabase.from("stock_balances").select("item_type, item_code, item_name, quantity, minimum_stock, unit_cost");
  const { data: production } = await supabase
    .from("production_orders")
    .select("id, status")
    .in("status", ["Direncanakan", "Diproses", "Menunggu QC"]);
  const { data: approvals } = await supabase.from("purchase_orders").select("id").eq("status", "Menunggu Persetujuan");

  if (sales === null && stock === null && production === null && approvals === null) return demoSnapshot;

  const sixMonthSales = sales ?? [];
  const monthlySales = sixMonthSales.filter((row) => new Date(row.created_at) >= new Date(start));
  const totalSales = monthlySales.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const inventoryValue = (stock ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0) * Number(row.unit_cost ?? 0), 0);
  const activeProduction = production?.length ?? 0;
  const pendingQc = production?.filter((row) => row.status === "Menunggu QC").length ?? 0;
  const monthlyTrend = Array.from({ length: 6 }, () => 0);
  for (const row of sixMonthSales) {
    const date = new Date(row.created_at);
    const monthOffset = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
    if (monthOffset >= 0 && monthOffset < 6) monthlyTrend[5 - monthOffset] += Number(row.total ?? 0);
  }
  const alerts = (stock ?? [])
    .filter((row) => Number(row.quantity ?? 0) <= Number(row.minimum_stock ?? 0))
    .slice(0, 3)
    .map((row) => ({
      name: row.item_name ?? row.item_code,
      code: row.item_code,
      stock: `${Number(row.quantity ?? 0)} unit`,
      threshold: `${Number(row.minimum_stock ?? 0)} unit`,
      severity: "urgent" as const,
    }));

  const liveRows = monthlySales.slice(0, 5).map((row, index) => {
    const name = row.customer_name ?? "Pelanggan";
    const initials = name.split(" ").map((part: string) => part[0]).slice(0, 2).join("").toUpperCase();
    const status: DashboardSnapshot["recentSales"][number]["status"] = row.status === "Terpenuhi" || row.status === "Selesai" ? "Selesai" : row.status === "Menunggu pembayaran" ? "Menunggu pembayaran" : "Diproses";
    return {
      id: row.id,
      customer: name,
      product: "Transaksi penjualan",
      date: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(row.created_at)),
      amount: money(Number(row.total ?? 0)),
      status,
      initials,
      tone: ["lavender", "peach", "mint", "blue", "rose"][index % 5],
    };
  });

  return {
    source: "supabase",
    metrics: [
      { ...dashboardMetrics[0], value: money(totalSales), change: "Terhubung", note: "penjualan tercatat bulan ini" },
      { ...dashboardMetrics[1], value: money(inventoryValue), change: "Terhubung", note: "dihitung dari saldo persediaan" },
      { ...dashboardMetrics[2], value: String(activeProduction), change: "Aktif", note: "perintah produksi berjalan" },
      { ...dashboardMetrics[3], value: "—", change: "Belum tersedia", note: "tambahkan biaya produksi untuk menghitung" },
    ],
    recentSales: liveRows.length ? liveRows : [],
    sales: monthlyTrend,
    alerts: alerts.length ? alerts : [],
    pendingQc,
    pendingApprovals: approvals?.length ?? 0,
  };
}
