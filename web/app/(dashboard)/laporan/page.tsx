import { redirect } from "next/navigation";

/**
 * Full-page /laporan is deprecated.
 * Soft-open the dashboard modal via PageActionsHost (?modal=laporan).
 */
export default function LaporanPage() {
  redirect("/?modal=laporan");
}
