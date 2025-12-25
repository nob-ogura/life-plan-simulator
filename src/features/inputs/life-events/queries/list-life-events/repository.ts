import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListLifeEventsQuery, ListLifeEventsRepository } from "./handler";
import type { ListLifeEventsResponse } from "./response";

export class SupabaseListLifeEventsRepository implements ListLifeEventsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListLifeEventsQuery): Promise<ListLifeEventsResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(
      this.client.from("life_events").select(),
      userId,
    ).order("id", { ascending: true });

    return unwrapSupabaseData(data, error);
  }
}
