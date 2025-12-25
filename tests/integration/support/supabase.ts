import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && publishableKey && secretKey);

export const assertSupabaseEnv = () => {
  if (!supabaseUrl || !publishableKey || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or SUPABASE_SECRET_KEY",
    );
  }
};

export const createAdminClient = () =>
  createClient<Database>(supabaseUrl ?? "", secretKey ?? "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

export const createUserClient = async (email: string, password: string) => {
  const client = createClient<Database>(supabaseUrl ?? "", publishableKey ?? "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return client;
};

export const createTestUser = async (
  admin: ReturnType<typeof createAdminClient>,
  label: string,
) => {
  const email = `integration-${label}+${randomUUID()}@example.com`;
  const password = `P@ssword-${randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw error ?? new Error("Failed to create test user");
  }

  return { id: data.user.id, email, password };
};

export const cleanupUserData = async (
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) => {
  const tables = [
    "assets",
    "children",
    "expenses",
    "income_streams",
    "life_events",
    "mortgages",
    "rentals",
    "profiles",
    "simulation_settings",
  ] as const;

  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error) {
      throw error;
    }
  }
};
