import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Sunting SBBK di GAS memakai modal `#sbbkModal` yang sama dengan entri baru,
 * jadi rute ini hanya meneruskan id-nya ke panel daftar.
 */
export default async function EditSbbkPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/sbbk?modal=edit&id=${encodeURIComponent(id)}`);
}
