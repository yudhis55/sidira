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
import { addRoom } from "@/lib/room-store";

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

  /** GAS menandai input merah lalu memfokuskannya bila nama kosong. */
  function submit() {
    const nama = name.trim();
    if (!nama) {
      setInvalid(true);
      nameRef.current?.focus();
      return;
    }
    setInvalid(false);
    const room = addRoom({ name: nama, icon, description: desc });
    toast.success(`Ruangan "${nama}" berhasil ditambahkan`);
    onClose();
    if (onCreated) onCreated(room.id);
    else router.push(`/inventaris/${room.id}`);
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
          <Button type="button" variant="modal-ok" onClick={submit}>
            ＋ Tambah Ruangan
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
