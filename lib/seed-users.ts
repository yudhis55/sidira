/**
 * Seed Default Users untuk SIDIRA v4
 * Menggunakan Supabase Admin API (service role key)
 *
 * Jalankan: npx tsx lib/seed-users.ts
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diset di .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  { email: "sidira@sidira.local", password: "sidira2026", username: "sidira", nama: "Admin SIDIRA", jabatan: "Administrator", role: "admin", avatar: "👨‍💼" },
  { email: "kapus@sidira.local", password: "kapus2026", username: "kapus", nama: "Kepala Puskesmas", jabatan: "Kepala Puskesmas", role: "viewer", avatar: "👨‍⚕️" },
  { email: "pengurus@sidira.local", password: "barang2026", username: "pengurus", nama: "Pengurus Barang", jabatan: "Pengurus Barang", role: "editor", avatar: "📦" },
];

async function seedUsers() {
  console.log("🚀 Mulai seed default users...\n");

  // Step 1: List existing users di auth.users
  console.log("📋 Mengecek user yang sudah ada...\n");
  const { data: existing, error: listErr } = await supabase.auth.admin.listUsers();

  if (listErr) {
    console.error("❌ Gagal list users:", JSON.stringify(listErr, null, 2));
    process.exit(1);
  }

  console.log(`   Ditemukan ${existing?.users?.length || 0} user di auth.users\n`);

  for (const user of users) {
    // Cek apakah email sudah ada
    const found = existing?.users?.find((u) => u.email === user.email);

    if (found) {
      console.log(`⚠️  ${user.email} sudah ada (id: ${found.id})`);
      console.log(`   Menghapus user lama untuk recreate dengan benar...\n`);

      const { error: delErr } = await supabase.auth.admin.deleteUser(found.id);
      if (delErr) {
        console.error(`   ❌ Gagal hapus: ${JSON.stringify(delErr, null, 2)}\n`);
        continue;
      }
      console.log(`   ✅ User lama dihapus\n`);
    }

    // Create user baru via Admin API
    console.log(`📝 Membuat user: ${user.username} (${user.nama})`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        username: user.username,
        nama: user.nama,
        jabatan: user.jabatan,
        role: user.role,
        avatar: user.avatar,
      },
    });

    if (error) {
      console.error(`   ❌ Gagal: ${JSON.stringify(error, null, 2)}\n`);
      continue;
    }

    console.log(`   ✅ Created! ID: ${data.user.id}`);
    console.log(`   📧 ${user.email} / ${user.password}`);
    console.log(`   👤 Role: ${user.role}\n`);
  }

  // Step 2: Hapus profile lama yang orphaned (dari SQL insert sebelumnya)
  console.log("🧹 Membersihkan profile lama yang orphaned...\n");
  const { data: profiles } = await supabase.from("profiles").select("id, username");
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authIds = new Set(authUsers?.users?.map((u) => u.id) || []);

  if (profiles) {
    for (const p of profiles) {
      if (!authIds.has(p.id)) {
        console.log(`   🗑 Menghapus orphaned profile: ${p.username} (${p.id})`);
        await supabase.from("profiles").delete().eq("id", p.id);
      }
    }
  }

  // Step 3: Verifikasi final
  console.log("\n🔍 Verifikasi final...\n");
  const { data: finalProfiles } = await supabase
    .from("profiles")
    .select("username, nama, jabatan, role, avatar")
    .order("role");

  if (finalProfiles && finalProfiles.length > 0) {
    console.log("✅ Profiles:\n");
    console.table(finalProfiles);
  }

  const { data: finalAuth } = await supabase.auth.admin.listUsers();
  console.log(`\n👥 Auth users: ${finalAuth?.users?.length || 0}\n`);

  console.log("✨ Selesai!\n");
  console.log("Login credentials:");
  console.log("   Admin:    sidira / sidira2026");
  console.log("   Editor:   pengurus / barang2026");
  console.log("   Viewer:   kapus / kapus2026\n");

  console.log("Jalankan: npm run dev\n");
}

seedUsers().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
