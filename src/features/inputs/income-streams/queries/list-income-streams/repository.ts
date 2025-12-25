import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListIncomeStreamsQuery, ListIncomeStreamsRepository } from "./handler";
import type { ListIncomeStreamsResponse } from "./response";

export class SupabaseListIncomeStreamsRepository implements ListIncomeStreamsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListIncomeStreamsQuery): Promise<ListIncomeStreamsResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(
      this.client.from("income_streams").select(),
      userId,
    ).order("id", { ascending: true });

    return unwrapSupabaseData(data, error);
  }
}
