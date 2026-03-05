import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Cliente Supabase com service_role (apenas para uso no servidor: API routes, server components).
 * Nunca exponha a service_role no frontend.
 */
export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export const isSupabaseConfigured = Boolean(supabaseAdmin);
