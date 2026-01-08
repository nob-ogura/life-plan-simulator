import type { SupabaseClient } from "@supabase/supabase-js";

import {
  scopeByUserId,
  toUserOwnedInsert,
} from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";
import type { UpsertRetirementBonusCommand, UpsertRetirementBonusRepository } from "./handler";
import type { UpsertRetirementBonusResponse } from "./response";

const isUniqueViolation = (error: { code?: string } | null): boolean => error?.code === "23505";

export class SupabaseUpsertRetirementBonusRepository implements UpsertRetirementBonusRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async upsert(command: UpsertRetirementBonusCommand): Promise<UpsertRetirementBonusResponse> {
    const { userId, label, amount, year_month } = command;
    const payload = {
      label,
      amount,
      year_month,
      repeat_interval_years: null,
      stop_after_age: null,
      stop_after_occurrences: null,
      category: "retirement_bonus" as const,
      auto_toggle_key: null,
      building_price: null,
      land_price: null,
      down_payment: null,
    };

    const insertPayload = toUserOwnedInsert({ userId, ...payload });

    const { data: created, error: insertError } = await this.client
      .from("life_events")
      .insert(insertPayload)
      .select()
      .single();

    if (isUniqueViolation(insertError)) {
      const { data: updated, error: updateError } = await scopeByUserId(
        this.client.from("life_events").update(payload).eq("category", "retirement_bonus"),
        userId,
      )
        .select()
        .single();

      return unwrapSupabaseData(updated, updateError);
    }

    return unwrapSupabaseData(created, insertError);
  }
}
