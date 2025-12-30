import type { SupabaseClient } from "@supabase/supabase-js";

import {
  scopeByUserAndId,
  scopeByUserId,
  toUserOwnedInsert,
} from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import {
  throwIfSupabaseError,
  unwrapSupabaseData,
} from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpsertRetirementBonusCommand, UpsertRetirementBonusRepository } from "./handler";
import type { UpsertRetirementBonusResponse } from "./response";

export class SupabaseUpsertRetirementBonusRepository implements UpsertRetirementBonusRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async upsert(command: UpsertRetirementBonusCommand): Promise<UpsertRetirementBonusResponse> {
    const { userId, label, amount, year_month } = command;
    const payload = {
      label,
      amount,
      year_month,
      repeat_interval_years: null,
      stop_after_occurrences: null,
      category: "retirement_bonus" as const,
      auto_toggle_key: null,
      building_price: null,
      land_price: null,
      down_payment: null,
    };

    const { data, error } = await scopeByUserId(
      this.client.from("life_events").select("id").eq("category", "retirement_bonus"),
      userId,
    ).order("year_month", { ascending: false });

    throwIfSupabaseError(error);

    const existing = data ?? [];
    const primary = existing[0] ?? null;
    const duplicateIds = existing.slice(1).map((row) => row.id);

    if (primary) {
      const { data: updated, error: updateError } = await scopeByUserAndId(
        this.client.from("life_events").update(payload),
        userId,
        primary.id,
      )
        .select()
        .single();

      const result = unwrapSupabaseData(updated, updateError);

      if (duplicateIds.length > 0) {
        const { error: deleteError } = await scopeByUserId(
          this.client.from("life_events").delete().in("id", duplicateIds),
          userId,
        );
        throwIfSupabaseError(deleteError);
      }

      return result;
    }

    const { data: created, error: insertError } = await this.client
      .from("life_events")
      .insert(toUserOwnedInsert({ userId, ...payload }))
      .select()
      .single();

    return unwrapSupabaseData(created, insertError);
  }
}
