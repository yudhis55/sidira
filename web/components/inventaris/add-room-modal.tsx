"use client";

/**
 * Modal Tambah Ruangan â€” port GAS `#modalOverlay` / `submitTambahRuangan`
 * (index.html 8609â€“8654, 19575â€“19636).
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "@phosphor-icons/react";
import { Modal } from "@/components/gas/modal";
import {
  EmojiGrid,
  EmojiPreview,
  ModalField,
  MODAL_INPUT_CLASS,
} from "@/components/gas/emoji-picker";
import { createRoom } from "@/lib/auth/rooms";

/** GAS membuka modal dengan ikon ðŸ  terpilih. */
const DEFAULT_ICON = "ðŸ ";

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  /** Dipanggil setelah ruangan tersimpan; default membuka ruangan baru. */
  onCreated?: (roomId: string) => void;
}

export function AddRoomModal({ open, onClose, onCreated }: AddRoomModalProps) {
  const router = useRouter();
  const [icon, setIcon] = React.useState(DEFAULT_ICON);
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);

  const [saving, setSaving] = React.useState(false);

  /** GAS menandai input merah lalu memfokuskannya bila nama kosong. */
  async function submit() {
    const nama = name.trim();
    if (!nama) {
      setInvalid(true);
      nameRef.current?.focus();
      return;
    }
    setInvalid(false);
    setSaving(true);
    const formData = new FormData();
    formData.set("name", nama);
    formData.set("icon", icon);
    formData.set("description", desc.trim());
    const res = await createRoom(formData).catch(() => ({
      error: "Gagal menyimpan ke server",
    }));
    setSaving(false);
    if (res && "error" in res && res.error) {
      toast.error(typeof res.error === "string" ? res.error : "Gagal menyimpan");
      return;
    }
    // id = slug nama (lihat createRoom) â€” samakan agar langsung dibuka.
    const slug = nama.toLowerCase().replace(/\s+/g, "-");
    toast.success(`Ruangan "${nama}" berhasil ditambahkan`);
    onClose();
    router.refresh();
    if (onCreated) onCreated(slug);
    else router.push(`/inventaris/${slug}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      icon={icon}
      title="Tambah Ruangan Baru"
      subtitle="Isi informasi ruangan yang akan ditambahkan"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-surface px-4 text-[13px] font-semibold text-foreground transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors duration-150 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50"
          >
            <Plus size={15} weight="bold" aria-hidden />
            {saving ? "Menyimpanâ€¦" : "Tambah Ruangan"}
          </button>
        </>
      }
    >
      <ModalField label="Pilih Ikon Ruangan">
        <EmojiGrid value={icon} onChange={setIcon} />
      </ModalField>

      <EmojiPreview
        icon={icon}
        name={name.trim()}
        placeholder="Nama ruangan akan tampil di sini"
      />

      <ModalField label="Nama Ruangan" required>
        <input
          ref={nameRef}
          type="text"
          value={name}
          autoFocus
          placeholder="Contoh: Ruang Fisioterapi"
          onChange={(e) => {
            setName(e.target.value);
            if (invalid) setInvalid(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className={`${MODAL_INPUT_CLASS} ${invalid ? "border-danger focus:border-danger" : ""}`}
        />
      </ModalField>

      <ModalField label="Deskripsi Singkat">
        <textarea
          value={desc}
          rows={2}
          placeholder="Contoh: Layanan rehabilitasi dan terapi fisik pasien"
          onChange={(e) => setDesc(e.target.value)}
          className={`${MODAL_INPUT_CLASS} min-h-16 resize-y`}
        />
      </ModalField>
    </Modal>
  );
}
