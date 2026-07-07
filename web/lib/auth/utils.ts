import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

/**
 * Get current authenticated user profile
 */
export async function getUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

/**
 * Check if user has required role
 */
export async function requireRole(roles: UserRole[]): Promise<Profile> {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  return user?.role === "admin";
}

/**
 * Check if current user can edit data (admin or editor)
 */
export async function canEdit(): Promise<boolean> {
  const user = await getUser();
  return user?.role === "admin" || user?.role === "editor";
}

/**
 * Check if current user can view data (any authenticated user)
 */
export async function canView(): Promise<boolean> {
  const user = await getUser();
  return !!user;
}
