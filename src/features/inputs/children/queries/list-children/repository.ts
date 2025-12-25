import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListChildrenQuery, ListChildrenRepository } from "./handler";
import type { ListChildrenResponse } from "./response";

export class SupabaseListChildrenRepository implements ListChildrenRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListChildrenQuery): Promise<ListChildrenResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("children")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
