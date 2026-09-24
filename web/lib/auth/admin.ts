"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/utils";
import type { Profile } from "@/types/database";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  nama: string;
  jabatan: string;
  role: "admin" | "editor" | "viewer";
  avatar: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  username: string;
  nama: string;
  jabatan: string;
  role: "admin" | "editor" | "viewer";
  avatar: string;
  updated_at: string;
}

export async function getAllUsers(): Promise<UserProfile[]> {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const admin = createAdminClient();

  // Operasi auth.admin WAJIB pakai service role client
  const {
    data: { users },
    error: authError,
  } = await admin.auth.admin.listUsers();

  if (authError) throw authError;

  // Profiles biasa cukup pakai server client (RLS: admin boleh baca/tulis)
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profileError) throw profileError;

  const profileList = (profiles ?? []) as ProfileRow[];

  // Merge auth users with profiles
  const userProfiles: UserProfile[] = (users ?? []).map((authUser) => {
    const profile = profileList.find((p) => p.id === authUser.id);
    return {
      id: authUser.id,
      username: profile?.username || authUser.email?.split("@")[0] || "",
      email: authUser.email || "",
      nama: profile?.nama || "",
      jabatan: profile?.jabatan || "",
      role: profile?.role || "viewer",
      avatar: profile?.avatar || "👤",
      last_login: authUser.last_sign_in_at || null,
      created_at: authUser.created_at,
      updated_at: profile?.updated_at || authUser.updated_at || "",
    };
  });

  return userProfiles;
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await admin.auth.admin.getUserById(userId);

  if (authError || !user) return null;

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) return null;

  const profile = profileData as ProfileRow | null;

  return {
    id: user.id,
    username: profile?.username || user.email?.split("@")[0] || "",
    email: user.email || "",
    nama: profile?.nama || "",
    jabatan: profile?.jabatan || "",
    role: profile?.role || "viewer",
    avatar: profile?.avatar || "👤",
    last_login: user.last_sign_in_at || null,
    created_at: user.created_at,
    updated_at: profile?.updated_at || user.updated_at || "",
  };
}

export async function createUser(formData: FormData) {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const nama = formData.get("nama") as string;
  const jabatan = formData.get("jabatan") as string;
  const role = formData.get("role") as "admin" | "editor" | "viewer";
  const avatar = formData.get("avatar") as string;

  if (!email || !password || !username || !nama || !role) {
    return { error: "Email, password, username, nama, dan role wajib diisi" };
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  // Check if username already exists
  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (existingUsername) {
    return { error: "Username sudah digunakan" };
  }

  // Create user via admin API (service role)
  const {
    data: { user },
    error: authError,
  } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      username,
      nama,
      jabatan,
      role,
      avatar: avatar || "👤",
    },
  });

  if (authError) {
    console.error("Error creating user:", authError);
    return { error: authError.message };
  }

  if (!user) {
    console.error("User creation failed: no user returned");
    return { error: "Gagal membuat user" };
  }

  // Profile will be created by trigger, but update it to ensure all fields are set
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    nama,
    jabatan,
    role,
    avatar: avatar || "👤",
  });

  if (profileError) {
    console.error("Error creating profile:", profileError);
    // Rollback: delete the auth user
    await admin.auth.admin.deleteUser(user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUser(userId: string, formData: FormData) {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const nama = formData.get("nama") as string;
  const jabatan = formData.get("jabatan") as string;
  const role = formData.get("role") as "admin" | "editor" | "viewer";
  const avatar = formData.get("avatar") as string;
  const password = formData.get("password") as string;

  if (!email || !username || !nama || !role) {
    return { error: "Email, username, nama, dan role wajib diisi" };
  }

  // Check if username already exists (excluding current user)
  const { data: existingUsername } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .neq("id", userId)
    .single();

  if (existingUsername) {
    return { error: "Username sudah digunakan" };
  }

  // Update auth user (email and password if provided)
  const updateAuthData: { email: string; password?: string } = { email };
  if (password && password.length >= 6) {
    updateAuthData.password = password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(
    userId,
    updateAuthData
  );

  if (authError) {
    console.error("Error updating auth user:", authError);
    return { error: authError.message };
  }

  // Update profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username,
      nama,
      jabatan,
      role,
      avatar: avatar || "👤",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return { error: profileError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function deleteUser(userId: string) {
  const caller = await requireRole(["admin"]);

  const supabase = await createClient();
  const admin = createAdminClient();

  // Cegah hapus akun sendiri: tolak bila id sama atau username target
  // sama dengan username pemanggil (mis. user `sidira` tidak bisa hapus diri).
  const { data: targetData } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", userId)
    .single();

  const target = targetData as { id: string; username: string } | null;

  if (caller.id === userId || (target && target.username === caller.username)) {
    return { error: "Tidak dapat menghapus akun sendiri" };
  }

  // Delete profile first (will cascade due to foreign key)
  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (profileError) {
    console.error("Error deleting profile:", profileError);
    return { error: profileError.message };
  }

  // Delete auth user (service role)
  const { error: authError } = await admin.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting auth user:", authError);
    return { error: authError.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { success: true };
}

export async function resetUserPassword(userId: string, newPassword: string) {
  await requireRole(["admin"]);

  const admin = createAdminClient();

  if (newPassword.length < 6) {
    return { error: "Password minimal 6 karakter" };
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    console.error("Error resetting password:", error);
    return { error: error.message };
  }

  return { success: true };
}
