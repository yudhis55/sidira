import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * GAS tidak punya halaman entri terpisah — semuanya lewat modal `#sbbkModal`.
 * Rute ini dipertahankan sebagai pintasan yang langsung membuka modal itu.
 */
export default function NewSbbkPage() {
  redirect("/sbbk?modal=new");
}
