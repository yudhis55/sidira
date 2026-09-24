import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/utils";

/**
 * Gerbang admin-only untuk /admin dan seluruh subrute.
 * Non-admin (termasuk viewer) diarahkan ke "/".
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole(["admin"]);
  } catch {
    redirect("/");
  }

  return <>{children}</>;
}
