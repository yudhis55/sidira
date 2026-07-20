import { redirect } from "next/navigation";

/**
 * Full-page /riwayat is deprecated.
 * Soft-open the dashboard modal via PageActionsHost (?modal=riwayat).
 */
export default function RiwayatPage() {
  redirect("/?modal=riwayat");
}
