import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CreateSimulationSettingsEndpoint } from "@/features/inputs/simulation-settings/commands/create-simulation-settings/endpoint";
import { CreateSimulationSettingsCommandHandler } from "@/features/inputs/simulation-settings/commands/create-simulation-settings/handler";
import { SupabaseCreateSimulationSettingsRepository } from "@/features/inputs/simulation-settings/commands/create-simulation-settings/repository";
import { ResetSimulationSettingsEndpoint } from "@/features/inputs/simulation-settings/commands/reset-simulation-settings/endpoint";
import { ResetSimulationSettingsCommandHandler } from "@/features/inputs/simulation-settings/commands/reset-simulation-settings/handler";
import { SupabaseResetSimulationSettingsRepository } from "@/features/inputs/simulation-settings/commands/reset-simulation-settings/repository";
import type { Database } from "@/types/supabase";

import {
  assertSupabaseEnv,
  cleanupTestUser,
  createAdminClient,
  createTestUser,
  createUserClient,
  hasSupabaseEnv,
} from "./support/supabase";

type AuthSession = {
  requireUserId: () => Promise<string>;
};

const itIf = hasSupabaseEnv ? it : it.skip;

const createAuthSession = (client: SupabaseClient<Database>): AuthSession => ({
  requireUserId: async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      throw error ?? new Error("Unauthorized");
    }
    return data.user.id;
  },
});

describe("Simulation settings actions", () => {
  let admin: ReturnType<typeof createAdminClient> | null = null;
  let user: Awaited<ReturnType<typeof createTestUser>> | null = null;
  let userClient: SupabaseClient<Database> | null = null;

  beforeAll(async () => {
    if (!hasSupabaseEnv) return;
    assertSupabaseEnv();
    admin = createAdminClient();
    user = await createTestUser(admin, "simulation-settings");
    userClient = await createUserClient(user.email, user.password);
  });

  afterAll(async () => {
    if (!hasSupabaseEnv || !admin || !user) return;
    await cleanupTestUser(admin, user.id);
  });

  itIf(
    "createSimulationSettings preserves defaults for unspecified fields (requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY)",
    async () => {
      if (!admin || !user || !userClient) {
        throw new Error("Supabase clients are not initialized.");
      }

      const { error: deleteError } = await admin
        .from("simulation_settings")
        .delete()
        .eq("user_id", user.id);
      if (deleteError) {
        throw deleteError;
      }

      const auth = createAuthSession(userClient);
      const repository = new SupabaseCreateSimulationSettingsRepository(userClient);
      const handler = new CreateSimulationSettingsCommandHandler(repository);
      const endpoint = new CreateSimulationSettingsEndpoint(handler, auth);

      const created = await endpoint.handle({ end_age: 95 });

      expect(created.end_age).toBe(95);
      expect(Number(created.start_offset_months)).toBe(0);
      expect(Number(created.mortgage_transaction_cost_rate)).toBeCloseTo(1.03, 5);
      expect(Number(created.real_estate_tax_rate)).toBeCloseTo(0.014, 5);
      expect(Number(created.real_estate_evaluation_rate)).toBeCloseTo(0.7, 5);
      expect(Number(created.pension_amount_single)).toBe(65000);
      expect(Number(created.pension_amount_spouse)).toBe(130000);
    },
  );

  itIf(
    "resetSimulationSettings restores DB defaults (requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY)",
    async () => {
      if (!admin || !user || !userClient) {
        throw new Error("Supabase clients are not initialized.");
      }

      const { error: upsertError } = await admin.from("simulation_settings").upsert(
        {
          user_id: user.id,
          start_offset_months: 4,
          end_age: 80,
          mortgage_transaction_cost_rate: 1.2,
          real_estate_tax_rate: 0.02,
          real_estate_evaluation_rate: 0.8,
        },
        { onConflict: "user_id" },
      );
      if (upsertError) {
        throw upsertError;
      }

      const auth = createAuthSession(userClient);
      const repository = new SupabaseResetSimulationSettingsRepository(userClient);
      const handler = new ResetSimulationSettingsCommandHandler(repository);
      const endpoint = new ResetSimulationSettingsEndpoint(handler, auth);

      const reset = await endpoint.handle({});

      expect(Number(reset.start_offset_months)).toBe(0);
      expect(Number(reset.end_age)).toBe(100);
      expect(Number(reset.mortgage_transaction_cost_rate)).toBeCloseTo(1.03, 5);
      expect(Number(reset.real_estate_tax_rate)).toBeCloseTo(0.014, 5);
      expect(Number(reset.real_estate_evaluation_rate)).toBeCloseTo(0.7, 5);
    },
  );
});
