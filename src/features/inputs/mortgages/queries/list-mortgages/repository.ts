import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListMortgagesQuery, ListMortgagesRepository } from "./handler";
import type { ListMortgagesResponse } from "./response";

export class SupabaseListMortgagesRepository implements ListMortgagesRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListMortgagesQuery): Promise<ListMortgagesResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("mortgages")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
