import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";
import type { Database } from "@/types/supabase";

const DEFAULT_EMAIL = "e2e@example.com";
const DEFAULT_PASSWORD = "P@ssword-e2e";
const USERS_PER_PAGE = 200;

const isE2EEnabled = () => process.env.E2E_ENABLED === "true";

const readJsonBody = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};

const getSupabaseAdminEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.");
  }

  return { supabaseUrl, supabaseSecretKey };
};

const createAdminClient = () => {
  const { supabaseUrl, supabaseSecretKey } = getSupabaseAdminEnv();

  return createClient<Database>(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const findUserByEmail = async (admin: ReturnType<typeof createAdminClient>, email: string) => {
  const target = normalizeEmail(email);
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: USERS_PER_PAGE,
    });
    if (error) {
      throw error;
    }

    const found = data.users.find((user) => normalizeEmail(user.email ?? "") === target);
    if (found) {
      return found;
    }

    if (!data.nextPage) {
      return null;
    }

    page = data.nextPage;
  }
};

const ensureUser = async (
  admin: ReturnType<typeof createAdminClient>,
  email: string,
  password: string,
) => {
  const existing = await findUserByEmail(admin, email);

  if (!existing) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw error ?? new Error("Failed to create E2E user.");
    }
    return data.user;
  }

  const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw error ?? new Error("Failed to update E2E user.");
  }

  return data.user;
};

export const POST = async (request: Request) => {
  if (!isE2EEnabled()) {
    return new Response(null, { status: 404 });
  }

  const payload = await readJsonBody(request);
  const email =
    typeof payload.email === "string" && payload.email.trim()
      ? payload.email.trim()
      : DEFAULT_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD ?? DEFAULT_PASSWORD;

  const admin = createAdminClient();
  const user = await ensureUser(admin, email, password);
  const supabase = createServerSupabaseClient();
  const loginEmail = user.email ?? email;
  const { error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: "Failed to create session." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: user.id });
};
