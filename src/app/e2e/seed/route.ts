import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  canRetryWithoutStopAfterAge,
  omitStopAfterAge,
} from "@/features/inputs/life-events/infrastructure/stop-after-age-compat";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";
import type { LifeEventCategory } from "@/shared/domain/life-events/categories";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import type { Database } from "@/types/supabase";

type LifeEventInsert = Database["public"]["Tables"]["life_events"]["Insert"];

const housingPurchaseCategory: LifeEventCategory = "housing_purchase";
const travelCategory: LifeEventCategory = "travel";

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

const clearUserData = async (
  userId: string,
  supabase: ReturnType<typeof createServerSupabaseClient> | ReturnType<typeof createAdminClient>,
) => {
  await supabase.from("rentals").delete().eq("user_id", userId);
  await supabase.from("life_events").delete().eq("user_id", userId);
};

const buildHousingPurchaseSeed = (currentYearMonth: string) => {
  const startYearMonth = YearMonth.create(currentYearMonth);
  const purchaseYearMonth = startYearMonth.addMonths(3);
  const stopYearMonth = purchaseYearMonth.addMonths(-1);
  const rentMonthly = 100000;

  return {
    startYearMonth: startYearMonth.toString(),
    purchaseYearMonth: purchaseYearMonth.toString(),
    stopYearMonth: stopYearMonth.toString(),
    rentMonthly,
  };
};

const buildRepeatStopSeed = (currentYearMonth: string) => {
  const startYearMonth = YearMonth.create(currentYearMonth);
  const repeatIntervalYears = 1;
  const stopAfterOccurrences = 2;
  const eventAmount = 50000;
  const intervalMonths = repeatIntervalYears * 12;
  const eventYearMonth = startYearMonth.addMonths(intervalMonths * (stopAfterOccurrences - 1));
  const afterStopYearMonth = startYearMonth.addMonths(intervalMonths * stopAfterOccurrences);

  return {
    startYearMonth: startYearMonth.toString(),
    repeatIntervalYears,
    stopAfterOccurrences,
    eventAmount,
    eventYearMonth: eventYearMonth.toString(),
    afterStopYearMonth: afterStopYearMonth.toString(),
  };
};

const insertLifeEvent = async (
  client: ReturnType<typeof createServerSupabaseClient> | ReturnType<typeof createAdminClient>,
  payload: LifeEventInsert,
) => {
  const { error } = await client.from("life_events").insert(payload);
  if (canRetryWithoutStopAfterAge(error, payload.stop_after_age)) {
    const { error: retryError } = await client
      .from("life_events")
      .insert(omitStopAfterAge(payload));
    return retryError ?? null;
  }
  return error ?? null;
};

export const POST = async (request: Request) => {
  if (!isE2EEnabled()) {
    return new Response(null, { status: 404 });
  }

  try {
    const payload = await readJsonBody(request);
    const scenario =
      typeof payload.scenario === "string" ? payload.scenario : "housing-purchase-stop";
    const requestedUserId = typeof payload.userId === "string" ? payload.userId : null;

    if (scenario !== "housing-purchase-stop" && scenario !== "repeat-stop") {
      return NextResponse.json(
        { ok: false, message: "Unknown E2E seed scenario." },
        { status: 400 },
      );
    }

    let client:
      | ReturnType<typeof createServerSupabaseClient>
      | ReturnType<typeof createAdminClient>;
    let userId = requestedUserId;

    if (!userId) {
      const supabase = createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id ?? null;
      client = supabase;
    } else {
      client = createAdminClient();
    }

    if (!userId) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }
    const currentYearMonth = YearMonth.now().toString();

    await clearUserData(userId, client);

    const { error: profileError } = await client.from("profiles").upsert(
      {
        user_id: userId,
        birth_year: 1990,
        birth_month: 1,
        spouse_birth_year: null,
        spouse_birth_month: null,
        pension_start_age: 65,
      },
      { onConflict: "user_id" },
    );
    if (profileError) {
      return NextResponse.json(
        { ok: false, message: "Failed to seed profile.", detail: profileError.message },
        { status: 500 },
      );
    }

    const { error: settingsError } = await client.from("simulation_settings").upsert(
      {
        user_id: userId,
        start_offset_months: 0,
        end_age: 90,
        pension_amount_single: 0,
        pension_amount_spouse: 0,
        mortgage_transaction_cost_rate: 1,
        real_estate_tax_rate: 0,
        real_estate_evaluation_rate: 0,
      },
      { onConflict: "user_id" },
    );
    if (settingsError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to seed simulation settings.",
          detail: settingsError.message,
        },
        { status: 500 },
      );
    }

    if (scenario === "housing-purchase-stop") {
      const seed = buildHousingPurchaseSeed(currentYearMonth);
      const { error: rentalError } = await client.from("rentals").insert({
        user_id: userId,
        rent_monthly: seed.rentMonthly,
        start_year_month: YearMonth.toMonthStartDateFromInput(seed.startYearMonth),
        end_year_month: null,
      });
      if (rentalError) {
        return NextResponse.json(
          { ok: false, message: "Failed to seed rentals.", detail: rentalError.message },
          { status: 500 },
        );
      }

      const lifeEventPayload = {
        user_id: userId,
        label: "Housing Purchase",
        amount: 0,
        year_month: YearMonth.toMonthStartDateFromInput(seed.purchaseYearMonth),
        repeat_interval_years: null,
        stop_after_age: null,
        stop_after_occurrences: null,
        category: housingPurchaseCategory,
        auto_toggle_key: "HOUSING_PURCHASE_STOP_RENT",
        building_price: 0,
        land_price: 0,
        down_payment: 0,
      };
      const lifeEventError = await insertLifeEvent(client, lifeEventPayload);
      if (lifeEventError) {
        return NextResponse.json(
          { ok: false, message: "Failed to seed life events.", detail: lifeEventError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({ ok: true, userId, ...seed });
    }

    const seed = buildRepeatStopSeed(currentYearMonth);
    const lifeEventPayload = {
      user_id: userId,
      label: "Recurring Travel",
      amount: seed.eventAmount,
      year_month: YearMonth.toMonthStartDateFromInput(seed.startYearMonth),
      repeat_interval_years: seed.repeatIntervalYears,
      stop_after_age: null,
      stop_after_occurrences: seed.stopAfterOccurrences,
      category: travelCategory,
      auto_toggle_key: null,
      building_price: null,
      land_price: null,
      down_payment: null,
    };
    const lifeEventError = await insertLifeEvent(client, lifeEventPayload);
    if (lifeEventError) {
      return NextResponse.json(
        { ok: false, message: "Failed to seed life events.", detail: lifeEventError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, userId, ...seed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
};
