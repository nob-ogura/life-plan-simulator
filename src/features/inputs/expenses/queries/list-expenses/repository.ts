import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListExpensesQuery, ListExpensesRepository } from "./handler";
import type { ListExpensesResponse } from "./response";

export class SupabaseListExpensesRepository implements ListExpensesRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListExpensesQuery): Promise<ListExpensesResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("expenses")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
