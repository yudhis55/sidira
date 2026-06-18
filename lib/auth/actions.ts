"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  console.log("🔐 Login attempt for username:", username);

  if (!username || !password) {
    console.log("❌ Missing username or password");
    return { error: "Username dan password harus diisi" };
  }

  // Pakai admin client untuk lookup profile (bypass RLS)
  // Karena user belum login, anon client tidak bisa baca profiles
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  console.log("📋 Profile lookup:", profileError ? `ERROR: ${profileError.message}` : `FOUND: ${profile?.username}`);

  if (!profile) {
    console.log("❌ Profile not found");
    return { error: "Username atau password salah" };
  }

  // Login dengan email (username@sidira.local)
  const email = `${username}@sidira.local`;
  console.log("📧 Attempting auth with email:", email);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log("🔑 Auth result:", error ? `ERROR: ${error.message}` : "SUCCESS");

  if (error) {
    console.log("❌ Auth failed:", error.message);
    return { error: "Username atau password salah" };
  }

  // Update last_login (pakai admin client karena session belum fully ready)
  await admin
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", profile.id);

  console.log("✅ Login successful, redirecting...");

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const nama = formData.get("nama") as string;
  const jabatan = (formData.get("jabatan") as string) || "";
  const role = (formData.get("role") as string) || "viewer";

  if (!username || !password || !nama) {
    return { error: "Username, password, dan nama harus diisi" };
  }

  const email = `${username}@sidira.local`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        nama,
        jabatan,
        role,
        avatar: "👤",
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Username sudah terdaftar" };
    }
    return { error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
