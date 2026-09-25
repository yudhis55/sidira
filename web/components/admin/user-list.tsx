"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/gas/card";
import { Button } from "@/components/gas/button";
import { Modal } from "@/components/gas/modal";
import { Table, type TableColumn } from "@/components/gas/table";
import { DeleteUserButton } from "./delete-button";
import { UserDetail } from "./user-detail";
import { UserForm } from "./user-form";
import type { Profile } from "@/types/database";

interface UserListProps {
  users: Profile[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-teal4 text-teal",
  editor: "bg-blue2 text-blue",
  viewer: "bg-slate2 text-slate",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-[8px] py-[2px] text-[11px] font-bold ${ROLE_COLORS[role] || "bg-line2 text-ink2"}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export function UserList({ users }: UserListProps) {
  const router = useRouter();
  const [detailUser, setDetailUser] = React.useState<Profile | null>(null);
  const [editingUser, setEditingUser] = React.useState<Profile | null>(null);
  const [creating, setCreating] = React.useState(false);

  /** Refresh daftar dari server setelah tulis (data fresh, modal tertutup). */
  const afterWrite = () => {
    setEditingUser(null);
    setCreating(false);
    setDetailUser(null);
    router.refresh();
  };
  const columns: TableColumn[] = [
    { key: "user", label: "User" },
    { key: "role", label: "Role", width: "100px" },
    { key: "jabatan", label: "Jabatan" },
    { key: "aksi", label: "Aksi", width: "180px" },
  ];

  const rows = users.map((user) => ({
    user: (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal4 text-sm font-bold text-teal">
          {user.avatar}
        </div>
        <div>
          <div className="font-mono font-semibold text-ink">{user.nama}</div>
          <div className="text-[11px] text-ink3">
            @{user.username} · {user.username}@sidira.local
          </div>
        </div>
      </div>
    ),
    role: <RoleBadge role={user.role} />,
    jabatan: <span className="text-ink2">{user.jabatan || "—"}</span>,
    aksi: (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] px-2 py-1"
          onClick={() => setDetailUser(user)}
        >
          Detail
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] px-2 py-1"
          onClick={() => setEditingUser(user)}
          aria-label={`Edit ${user.username}`}
        >
          ✏️
        </Button>
        <DeleteUserButton userId={user.id} username={user.username} />
      </div>
    ),
  }));

  // UserForm menavigasi sendiri setelah sukses; di dalam modal cukup
  // tutup + refresh agar daftar tampil segar.
  const formKey = editingUser
    ? `edit-${editingUser.id}`
    : creating
      ? "new"
      : "closed";

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-sm font-bold text-ink">Daftar User</p>
          <p className="text-[11px] text-ink3">Total: {users.length} user</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <span className="mr-1" aria-hidden>
            ➕
          </span>
          Tambah User
        </Button>
      </div>
      {users.length === 0 ? (
        <div className="py-12 text-center text-ink3">📭 Belum ada user</div>
      ) : (
        <Table columns={columns} rows={rows} striped />
      )}

      {/* Modal detail — konten UserDetail yang sama dengan halaman. */}
      <Modal
        open={detailUser !== null}
        onClose={() => setDetailUser(null)}
        headVariant="gas"
        size="md"
        icon="👤"
        title={detailUser ? detailUser.nama : "Detail User"}
        subtitle="Informasi lengkap akun"
        footer={
          <>
            {detailUser && (
              <Button
                type="button"
                variant="modal-ok"
                onClick={() => {
                  setEditingUser(detailUser);
                  setDetailUser(null);
                }}
              >
                ✏️ Edit
              </Button>
            )}
            <Button
              type="button"
              variant="modal-cancel"
              onClick={() => setDetailUser(null)}
            >
              Tutup
            </Button>
          </>
        }
      >
        {detailUser && (
          <UserDetail
            user={detailUser}
            hideNav
            onEdit={() => {
              setEditingUser(detailUser);
              setDetailUser(null);
            }}
          />
        )}
      </Modal>

      {/* Modal tambah/edit — UserForm yang sama, refresh saat sukses. */}
      <Modal
        open={editingUser !== null || creating}
        onClose={() => {
          setEditingUser(null);
          setCreating(false);
        }}
        headVariant="gas"
        size="md"
        icon={editingUser ? "✏️" : "➕"}
        title={editingUser ? "Edit User" : "Tambah User Baru"}
        subtitle="Pastikan data terisi dengan benar"
        footer={
          <Button
            type="button"
            variant="modal-cancel"
            onClick={() => {
              setEditingUser(null);
              setCreating(false);
            }}
          >
            Tutup
          </Button>
        }
      >
        <UserForm
          key={formKey}
          user={editingUser ?? undefined}
          onSuccess={afterWrite}
        />
      </Modal>
    </Card>
  );
}
