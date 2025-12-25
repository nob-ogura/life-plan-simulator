import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const hasEnv = Boolean(supabaseUrl && publishableKey && secretKey);
const itIf = hasEnv ? it : it.skip;

const createAdminClient = () =>
  createClient<Database>(supabaseUrl ?? "", secretKey ?? "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

const createUserClient = async (email: string, password: string) => {
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

describe("Phase 2 RLS policies", () => {
  itIf(
    "enforces per-user access for profiles and simulation_settings (requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY)",
    async () => {
      if (!supabaseUrl || !publishableKey || !secretKey) {
        throw new Error(
          "Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or SUPABASE_SECRET_KEY",
        );
      }

      const admin = createAdminClient();
      const userA = {
        email: `rls-user-a+${randomUUID()}@example.com`,
        password: `P@ssword-${randomUUID()}`,
      };
      const userB = {
        email: `rls-user-b+${randomUUID()}@example.com`,
        password: `P@ssword-${randomUUID()}`,
      };

      let userAId: string | null = null;
      let userBId: string | null = null;

      try {
        const { data: userAData, error: userAError } = await admin.auth.admin.createUser({
          email: userA.email,
          password: userA.password,
          email_confirm: true,
        });
        if (userAError || !userAData.user) {
          throw userAError ?? new Error("Failed to create user A");
        }
        userAId = userAData.user.id;

        const { data: userBData, error: userBError } = await admin.auth.admin.createUser({
          email: userB.email,
          password: userB.password,
          email_confirm: true,
        });
        if (userBError || !userBData.user) {
          throw userBError ?? new Error("Failed to create user B");
        }
        userBId = userBData.user.id;

        await Promise.all([
          waitForRecord(admin, "profiles", userAId),
          waitForRecord(admin, "simulation_settings", userAId),
          waitForRecord(admin, "profiles", userBId),
          waitForRecord(admin, "simulation_settings", userBId),
        ]);

        const userAClient = await createUserClient(userA.email, userA.password);

        const { data: ownProfile, error: ownProfileError } = await userAClient
          .from("profiles")
          .select("user_id")
          .maybeSingle();
        if (ownProfileError) {
          throw ownProfileError;
        }
        expect(ownProfile?.user_id).toBe(userAId);

        const { data: otherProfile, error: otherProfileError } = await userAClient
          .from("profiles")
          .select("user_id")
          .eq("user_id", userBId)
          .maybeSingle();
        if (otherProfileError) {
          throw otherProfileError;
        }
        expect(otherProfile).toBeNull();

        const { data: ownProfileUpdate, error: ownProfileUpdateError } = await userAClient
          .from("profiles")
          .update({ pension_start_age: 66 })
          .eq("user_id", userAId)
          .select("pension_start_age");
        if (ownProfileUpdateError) {
          throw ownProfileUpdateError;
        }
        expect(ownProfileUpdate?.[0]?.pension_start_age).toBe(66);

        const { data: otherProfileUpdate, error: otherProfileUpdateError } = await userAClient
          .from("profiles")
          .update({ pension_start_age: 67 })
          .eq("user_id", userBId)
          .select("user_id");
        if (otherProfileUpdateError) {
          throw otherProfileUpdateError;
        }
        expect(otherProfileUpdate?.length ?? 0).toBe(0);

        const { data: ownSettings, error: ownSettingsError } = await userAClient
          .from("simulation_settings")
          .select("user_id")
          .maybeSingle();
        if (ownSettingsError) {
          throw ownSettingsError;
        }
        expect(ownSettings?.user_id).toBe(userAId);

        const { data: otherSettings, error: otherSettingsError } = await userAClient
          .from("simulation_settings")
          .select("user_id")
          .eq("user_id", userBId)
          .maybeSingle();
        if (otherSettingsError) {
          throw otherSettingsError;
        }
        expect(otherSettings).toBeNull();

        const { data: ownSettingsUpdate, error: ownSettingsUpdateError } = await userAClient
          .from("simulation_settings")
          .update({ end_age: 101 })
          .eq("user_id", userAId)
          .select("end_age");
        if (ownSettingsUpdateError) {
          throw ownSettingsUpdateError;
        }
        expect(ownSettingsUpdate?.[0]?.end_age).toBe(101);

        const { data: otherSettingsUpdate, error: otherSettingsUpdateError } = await userAClient
          .from("simulation_settings")
          .update({ end_age: 102 })
          .eq("user_id", userBId)
          .select("user_id");
        if (otherSettingsUpdateError) {
          throw otherSettingsUpdateError;
        }
        expect(otherSettingsUpdate?.length ?? 0).toBe(0);

        const { data: deleteAttempt, error: deleteAttemptError } = await userAClient
          .from("simulation_settings")
          .delete()
          .eq("user_id", userBId)
          .select("user_id");
        if (deleteAttemptError) {
          throw deleteAttemptError;
        }
        expect(deleteAttempt?.length ?? 0).toBe(0);

        const { data: stillThere, error: stillThereError } = await admin
          .from("simulation_settings")
          .select("user_id")
          .eq("user_id", userBId)
          .maybeSingle();
        if (stillThereError) {
          throw stillThereError;
        }
        expect(stillThere?.user_id).toBe(userBId);
      } finally {
        if (userAId) {
          await admin.auth.admin.deleteUser(userAId);
        }
        if (userBId) {
          await admin.auth.admin.deleteUser(userBId);
        }
      }
    },
    20000,
  );
});
