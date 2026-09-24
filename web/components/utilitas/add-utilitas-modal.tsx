"use client";

/**
 * Modal Tambah Utilitas — port GAS `#utilModalOverlay` / `utilAddNew`
 * (index.html 8656–8695, 19552–19568).
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
import { createUtilMeta } from "@/lib/auth/utilitas";
import { generateRoomId } from "@/lib/business-logic";

/** GAS membuka modal utilitas dengan ikon ⚙️ terpilih. */
const DEFAULT_ICON = "⚙️";

interface AddUtilitasModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (utilId: string) => void;
}

export function AddUtilitasModal({
  open,
  onClose,
  onCreated,
}: AddUtilitasModalProps) {
  const router = useRouter();
  const [icon, setIcon] = React.useState(DEFAULT_ICON);
  const [label, setLabel] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const labelRef = React.useRef<HTMLInputElement>(null);

  async function submit() {
    const nama = label.trim();
    if (!nama) {
      setInvalid(true);
      labelRef.current?.focus();
      return;
    }
    if (saving) return;
    setInvalid(false);
    // ID utilitas baru = slug nama (konsisten pola rooms via generateRoomId).
    // Slug hanya berisi huruf/angka/strip — tidak pernah berawalan `custom_`
    // sehingga tidak tabrakan dengan cabang lokal `custom_*` (localStorage).
    let utilId = generateRoomId(nama);
    if (!utilId) utilId = `util-${Date.now()}`;
    const formData = new FormData();
    formData.set("util_id", utilId);
    formData.set("label", nama);
    formData.set("icon", icon);
    formData.set("warna", "#0e7c6b");
    formData.set("bg", "#d4f0eb");
    formData.set("order_no", "0");
    setSaving(true);
    try {
      const result = await createUtilMeta(formData);
      if (result?.error) {
        toast.error(result.error);
        setSaving(false);
        return;
      }
    } catch (err) {
      // createUtilMeta memanggil redirect() saat sukses — Next menavigasi
      // otomatis. Bedakan dari kegagalan sungguhan via digest redirect.
      const digest =
        typeof err === "object" && err !== null && "digest" in err
          ? String((err as { digest: unknown }).digest)
          : "";
      if (!digest.startsWith("NEXT_REDIRECT")) {
        toast.error("Gagal menambahkan utilitas. Coba lagi.");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    toast.success(`Utilitas "${nama}" berhasil ditambahkan`);
    onClose();
    if (onCreated) onCreated(utilId);
    else router.push(`/utilitas/${utilId}`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      headVariant="gas"
      size="md"
      icon={icon}
      title="Tambah Utilitas Baru"
      subtitle="Pilih ikon dan isi nama utilitas"
      footer={
        <>
          <Button type="button" variant="modal-cancel" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="button" variant="modal-ok" onClick={submit} disabled={saving}>
            ＋ Tambah Utilitas
          </Button>
        </>
      }
    >
      <ModalField label="Pilih Ikon Utilitas">
        <EmojiGrid value={icon} onChange={setIcon} />
      </ModalField>

      <EmojiPreview
        icon={icon}
        name={label.trim()}
        placeholder="Nama utilitas akan tampil di sini"
      />

      <ModalField label="Nama Utilitas" required>
        <input
          ref={labelRef}
          type="text"
          value={label}
          autoFocus
          placeholder="Contoh: Pompa Air Cadangan"
          onChange={(e) => {
            setLabel(e.target.value);
            if (invalid) setInvalid(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          className={`${MODAL_INPUT_CLASS} ${invalid ? "border-red" : ""}`}
        />
      </ModalField>
    </Modal>
  );
}
