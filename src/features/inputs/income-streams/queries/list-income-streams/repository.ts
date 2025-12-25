import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListIncomeStreamsQuery, ListIncomeStreamsRepository } from "./handler";
import type { ListIncomeStreamsResponse } from "./response";

export class SupabaseListIncomeStreamsRepository implements ListIncomeStreamsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListIncomeStreamsQuery): Promise<ListIncomeStreamsResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("income_streams")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
