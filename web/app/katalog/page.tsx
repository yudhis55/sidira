import { redirect } from "next/navigation";

/**
 * Katalog kini tampil di landing page (`/`).
 * Rute lama dipertahankan sebagai alias agar tautan lama tetap bekerja.
 */
export default function KatalogPage() {
  redirect("/");
}
