import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListLifeEventsQuery, ListLifeEventsRepository } from "./handler";
import type { ListLifeEventsResponse } from "./response";

export class SupabaseListLifeEventsRepository implements ListLifeEventsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListLifeEventsQuery): Promise<ListLifeEventsResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("life_events")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
