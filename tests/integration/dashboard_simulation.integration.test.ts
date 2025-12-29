import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { GetDashboardSimulationEndpoint } from "@/features/dashboard/queries/get-dashboard-simulation/endpoint";
import { GetDashboardSimulationQueryHandler } from "@/features/dashboard/queries/get-dashboard-simulation/handler";
import { SupabaseGetDashboardSimulationRepository } from "@/features/dashboard/queries/get-dashboard-simulation/repository";
import { getCurrentYearMonth, toMonthStartDate } from "@/lib/year-month";
import type { Database } from "@/types/supabase";

import {
  assertSupabaseEnv,
  cleanupUserData,
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

describe("Dashboard Simulation Flow", () => {
  let admin: ReturnType<typeof createAdminClient> | null = null;
  let user: Awaited<ReturnType<typeof createTestUser>> | null = null;
  let userClient: SupabaseClient<Database> | null = null;

  beforeAll(async () => {
    if (!hasSupabaseEnv) return;
    assertSupabaseEnv();
    admin = createAdminClient();
    user = await createTestUser(admin, "dashboard-simulation");
    userClient = await createUserClient(user.email, user.password);
  });

  afterAll(async () => {
    if (!hasSupabaseEnv || !admin || !user) return;
    await cleanupUserData(admin, user.id);
  });

  itIf(
    "generates a simulation result from stored inputs (requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY)",
    async () => {
      if (!admin || !user || !userClient) {
        throw new Error("Supabase clients are not initialized.");
      }

      const currentYearMonth = getCurrentYearMonth();
      const [yearText, monthText] = currentYearMonth.split("-");
      const currentYear = Number(yearText);
      const currentMonth = Number(monthText);
      const birthYear = currentYear - 30;
      const birthMonth = currentMonth;
      const startYearMonth = toMonthStartDate(currentYearMonth);

      const { error: profileError } = await admin.from("profiles").upsert(
        {
          user_id: user.id,
          birth_year: birthYear,
          birth_month: birthMonth,
          spouse_birth_year: null,
          spouse_birth_month: null,
          pension_start_age: 65,
        },
        { onConflict: "user_id" },
      );
      if (profileError) {
        throw profileError;
      }

      const { error: settingsError } = await admin.from("simulation_settings").upsert(
        {
          user_id: user.id,
          start_offset_months: 0,
          end_age: 90,
          pension_amount_single: 0,
          pension_amount_spouse: 0,
          mortgage_transaction_cost_rate: 1.03,
          real_estate_tax_rate: 0.014,
          real_estate_evaluation_rate: 0.7,
        },
        { onConflict: "user_id" },
      );
      if (settingsError) {
        throw settingsError;
      }

      const { error: incomeError } = await admin.from("income_streams").insert({
        user_id: user.id,
        label: "給与",
        take_home_monthly: 100000,
        bonus_months: [],
        bonus_amount: 0,
        raise_rate: 0,
        start_year_month: startYearMonth,
      });
      if (incomeError) {
        throw incomeError;
      }

      const auth = createAuthSession(userClient);
      const repository = new SupabaseGetDashboardSimulationRepository(userClient);
      const handler = new GetDashboardSimulationQueryHandler(repository);
      const endpoint = new GetDashboardSimulationEndpoint(handler, auth);

      const response = await endpoint.handle({});
      expect(response.result).not.toBeNull();
      const result = response.result;
      expect(result?.months.length).toBeGreaterThan(0);
      expect(result?.months[0]?.yearMonth).toBe(currentYearMonth);
      expect(result?.months[0]?.totalIncome).toBeCloseTo(100000, 5);
    },
  );
});
