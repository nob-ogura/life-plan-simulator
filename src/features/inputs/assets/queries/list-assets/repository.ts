import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListAssetsQuery, ListAssetsRepository } from "./handler";
import type { ListAssetsResponse } from "./response";

export class SupabaseListAssetsRepository implements ListAssetsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListAssetsQuery): Promise<ListAssetsResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("assets")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
