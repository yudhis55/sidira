import Link from "next/link";
import { getWhitelist } from "@/lib/auth/marketplace";
import { getUser } from "@/lib/auth/utils";
import { WhitelistClient } from "@/components/marketplace/admin/whitelist-client";
import type { WhitelistPemohon } from "@/lib/marketplace-types";

export default async function AdminWhitelistPage() {
  const user = await getUser();

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-[560px] py-16 text-center">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
          Akses ditolak
        </h1>
        <p className="mt-2 text-[13px] text-text-2">
          Halaman ini hanya untuk admin.
        </p>
        <Link
          href="/pengajuan"
          className="mt-5 inline-flex h-9 items-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground hover:bg-surface-muted"
        >
          Kembali ke Pengajuan
        </Link>
      </div>
    );
  }

  const list = await getWhitelist().catch((): WhitelistPemohon[] => []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
          Whitelist Pemohon
        </h1>
        <p className="mt-1 text-[13px] text-text-3">
          {list.length} nama terdaftar
        </p>
      </div>

      <WhitelistClient list={list} />
    </div>
  );
}
