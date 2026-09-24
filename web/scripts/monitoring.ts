/**
 * SIDIRA Monitoring & Health Check Script
 *
 * Script ini mengecek kesehatan sistem dan menampilkan laporan:
 * - Koneksi database
 * - Jumlah data per tabel
 * - User aktif
 * - Disk usage estimation
 * - Performance metrics
 *
 * CARA JALANKAN:
 *   npx tsx scripts/monitoring.ts
 *
 * CRON (opsional): Jalankan otomatis setiap jam
 *   Windows Task Scheduler atau Linux crontab
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TABLES = [
  "profiles",
  "rooms",
  "items",
  "checklist",
  "sbbk",
  "pakta",
  "penanggung_jawab",
  "riwayat_pindah",
  "util_items",
  "util_meta",
  "util_state",
  "usulan",
  "log",
];

// ═══════════════════════════════════════════════════════
//  Health Check Functions
// ═══════════════════════════════════════════════════════

async function checkDatabaseConnection(): Promise<boolean> {
  const start = Date.now();
  const { error } = await supabase.from("rooms").select("id").limit(1);
  const latency = Date.now() - start;

  if (error) {
    console.log(`  ❌ Database connection failed: ${error.message}`);
    return false;
  }

  console.log(`  ✅ Database connected (${latency}ms)`);
  return true;
}

async function getTableCounts(): Promise<Record<string, number>> {
  // Paralel — keep-alive harian tak perlu bayar latency 13x sekuensial
  const entries = await Promise.all(
    TABLES.map(async (table) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      return [table, error ? -1 : count || 0] as const;
    })
  );

  return Object.fromEntries(entries);
}

async function getUserStats() {
  const { data: users, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.log(`  ❌ Failed to fetch users: ${error.message}`);
    return null;
  }

  const total = users?.users?.length || 0;
  const activeToday = users?.users?.filter((u) => {
    const lastSign = new Date(u.last_sign_in_at || 0);
    const today = new Date();
    return lastSign.toDateString() === today.toDateString();
  }).length || 0;

  return { total, activeToday };
}

async function getRecentActivity(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data: logs, error } = await supabase
    .from("log")
    .select("action, ts")
    .gte("ts", since)
    .order("ts", { ascending: false })
    .limit(100);

  if (error) {
    return null;
  }

  // Group by action
  const actionCounts: Record<string, number> = {};
  logs?.forEach((log: { action: string; ts: string }) => {
    actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
  });

  return {
    totalActions: logs?.length || 0,
    byAction: actionCounts,
  };
}

async function getChecklistStats() {
  const today = new Date().toISOString().split("T")[0];

  const { count: todayEntries } = await supabase
    .from("checklist")
    .select("*", { count: "exact", head: true })
    .eq("date_key", today);

  const { count: totalEntries } = await supabase
    .from("checklist")
    .select("*", { count: "exact", head: true });

  return {
    today: todayEntries || 0,
    total: totalEntries || 0,
  };
}

async function getInventoryStats() {
  const { data: conditionData } = await supabase
    .from("items")
    .select("condition");

  const stats = { baik: 0, rr: 0, rb: 0, ta: 0, total: 0 };

  conditionData?.forEach((item: { condition: string }) => {
    stats.total++;
    if (item.condition in stats && item.condition !== "total") {
      (stats as Record<string, number>)[item.condition]++;
    }
  });

  return stats;
}

// ═══════════════════════════════════════════════════════
//  Alert System
// ═══════════════════════════════════════════════════════

interface Alert {
  level: "info" | "warning" | "critical";
  message: string;
}

function checkAlerts(counts: Record<string, number>): Alert[] {
  const alerts: Alert[] = [];

  // Check for large tables (potential performance issue)
  for (const [table, count] of Object.entries(counts)) {
    if (count > 100000) {
      alerts.push({
        level: "warning",
        message: `Table "${table}" has ${count} rows - consider archiving old data`,
      });
    }
    if (count > 500000) {
      alerts.push({
        level: "critical",
        message: `Table "${table}" has ${count} rows - URGENT: archive or partition needed`,
      });
    }
  }

  // Check for empty critical tables
  if (counts.rooms === 0) {
    alerts.push({ level: "info", message: "No rooms found - system may need initial setup" });
  }

  if (counts.profiles === 0) {
    alerts.push({ level: "warning", message: "No user profiles found!" });
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════
//  Main Report
// ═══════════════════════════════════════════════════════

async function runHealthCheck() {
  const startTime = Date.now();

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║         SIDIRA Health Check & Monitoring Report         ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\n📅 ${new Date().toLocaleString("id-ID")}\n`);

  // 1. Database Connection
  console.log("── 1. Database Connection ──");
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    console.log("\n❌ Cannot proceed without database connection");
    process.exit(1);
  }

  // 2. Table Counts
  console.log("\n── 2. Data Volume ──");
  const counts = await getTableCounts();
  console.log("");
  console.log("  Table                 | Records");
  console.log("  ──────────────────────┼──────────");
  for (const [table, count] of Object.entries(counts)) {
    const countStr = count === -1 ? "ERROR" : String(count);
    console.log(`  ${table.padEnd(21)} | ${countStr}`);
  }

  // 3. User Stats
  console.log("\n── 3. Users ──");
  const userStats = await getUserStats();
  if (userStats) {
    console.log(`  Total users: ${userStats.total}`);
    console.log(`  Active today: ${userStats.activeToday}`);
  }

  // 4. Checklist Stats
  console.log("\n── 4. Checklist ──");
  const clStats = await getChecklistStats();
  console.log(`  Entries today: ${clStats.today}`);
  console.log(`  Total entries: ${clStats.total}`);

  // 5. Inventory Stats
  console.log("\n── 5. Inventory Health ──");
  const invStats = await getInventoryStats();
  console.log(`  Total items: ${invStats.total}`);
  console.log(`  Baik: ${invStats.baik} (${invStats.total > 0 ? Math.round(invStats.baik / invStats.total * 100) : 0}%)`);
  console.log(`  Rusak Ringan: ${invStats.rr}`);
  console.log(`  Rusak Berat: ${invStats.rb}`);
  console.log(`  Tidak Ada: ${invStats.ta}`);

  // 6. Recent Activity
  console.log("\n── 6. Recent Activity (24h) ──");
  const activity = await getRecentActivity();
  if (activity) {
    console.log(`  Total actions: ${activity.totalActions}`);
    for (const [action, count] of Object.entries(activity.byAction)) {
      console.log(`    ${action}: ${count}`);
    }
  } else {
    console.log("  No activity data available");
  }

  // 7. Alerts
  console.log("\n── 7. Alerts ──");
  const alerts = checkAlerts(counts);
  if (alerts.length === 0) {
    console.log("  ✅ No alerts");
  } else {
    for (const alert of alerts) {
      const icon = alert.level === "critical" ? "🔴" : alert.level === "warning" ? "🟡" : "ℹ️";
      console.log(`  ${icon} [${alert.level.toUpperCase()}] ${alert.message}`);
    }
  }

  // Summary
  const elapsed = Date.now() - startTime;
  console.log(`\n${"─".repeat(58)}`);
  console.log(`✅ Health check completed in ${elapsed}ms\n`);
}

runHealthCheck().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
