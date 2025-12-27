import type { SupabaseClient } from "@supabase/supabase-js";

import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { IncomeStreamInsertPayload, IncomeStreamUpdateItem } from "./domain/diff";
import type { BulkSaveIncomeStreamsRepository } from "./handler";

export class SupabaseBulkSaveIncomeStreamsRepository implements BulkSaveIncomeStreamsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async deleteByIds(command: { userId: string; ids: string[] }): Promise<void> {
    const { userId, ids } = command;
    if (ids.length === 0) return;

    const { error } = await this.client
      .from("income_streams")
      .delete()
      .in("id", ids)
      .eq("user_id", userId);

    throwIfSupabaseError(error);
  }

  async insertMany(command: {
    userId: string;
    payloads: IncomeStreamInsertPayload[];
  }): Promise<void> {
    const { userId, payloads } = command;
    if (payloads.length === 0) return;

    const { error } = await this.client
      .from("income_streams")
      .insert(payloads.map((payload) => ({ ...payload, user_id: userId })));

    throwIfSupabaseError(error);
  }

  async updateMany(command: { userId: string; updates: IncomeStreamUpdateItem[] }): Promise<void> {
    const { userId, updates } = command;
    if (updates.length === 0) return;

    const results = await Promise.all(
      updates.map(({ id, payload }) =>
        this.client.from("income_streams").update(payload).eq("id", id).eq("user_id", userId),
      ),
    );

    const firstError = results.find((result) => result.error)?.error;
    if (firstError) {
      throw firstError;
    }
  }
}
