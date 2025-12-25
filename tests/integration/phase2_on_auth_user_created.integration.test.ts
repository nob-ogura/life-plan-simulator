import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const hasEnv = Boolean(supabaseUrl && secretKey);
const itIf = hasEnv ? it : it.skip;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForRecord = async (
  supabase: ReturnType<typeof createClient<Database>>,
  table: "profiles" | "simulation_settings",
  userId: string,
) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase
      .from(table)
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return;
    }

    await sleep(200);
  }

  throw new Error(`Timed out waiting for ${table} record for user ${userId}`);
};

describe("Phase 2 auth trigger integration", () => {
  itIf(
    "creates profiles and simulation_settings on user creation (requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY)",
    async () => {
      if (!supabaseUrl || !secretKey) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY");
      }

      const supabase = createClient<Database>(supabaseUrl, secretKey, {
        auth: {
          persistSession: false,
        },
      });

      const email = `trigger-test+${randomUUID()}@example.com`;
      const password = `P@ssword-${randomUUID()}`;

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error || !data.user) {
        throw error ?? new Error("Failed to create auth user");
      }

      const userId = data.user.id;

      try {
        await waitForRecord(supabase, "profiles", userId);
        await waitForRecord(supabase, "simulation_settings", userId);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("pension_start_age")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        expect(profile?.pension_start_age).toBe(65);

        const { data: settings, error: settingsError } = await supabase
          .from("simulation_settings")
          .select("start_offset_months,end_age")
          .eq("user_id", userId)
          .maybeSingle();

        if (settingsError) {
          throw settingsError;
        }

        expect(settings?.start_offset_months).toBe(0);
        expect(settings?.end_age).toBe(100);
      } finally {
        await supabase.auth.admin.deleteUser(userId);
      }
    },
  );
});
