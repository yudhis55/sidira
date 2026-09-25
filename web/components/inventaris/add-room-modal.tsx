"use client";

/**
 * Modal Tambah Ruangan — port GAS `#modalOverlay` / `submitTambahRuangan`
 * (index.html 8609–8654, 19575–19636).
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/gas/button";
import { Modal } from "@/components/gas/modal";
import {
  EmojiGrid,
  EmojiPreview,
  ModalField,
  MODAL_INPUT_CLASS,
} from "@/components/gas/emoji-picker";
import { createRoom } from "@/lib/auth/rooms";

/** GAS membuka modal dengan ikon 🏠 terpilih. */
const DEFAULT_ICON = "🏠";

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
    // id = slug nama (lihat createRoom) — samakan agar langsung dibuka.
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
      headVariant="gas"
      size="md"
      icon={icon}
      title="Tambah Ruangan Baru"
      subtitle="Isi informasi ruangan yang akan ditambahkan"
      footer={
        <>
          <Button type="button" variant="modal-cancel" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            variant="modal-ok"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Menyimpan…" : "＋ Tambah Ruangan"}
          </Button>
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
          className={`${MODAL_INPUT_CLASS} ${invalid ? "border-red" : ""}`}
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
