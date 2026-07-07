import { createClient } from "@supabase/supabase-js";

/**
 * Admin client menggunakan service role key.
 * Bisa bypass RLS - HANYA untuk server-side operations.
 * JANGAN expose ke client/browser!
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
