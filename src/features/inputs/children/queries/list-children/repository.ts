import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListChildrenQuery, ListChildrenRepository } from "./handler";
import type { ListChildrenResponse } from "./response";

export class SupabaseListChildrenRepository implements ListChildrenRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListChildrenQuery): Promise<ListChildrenResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(
      this.client.from("children").select(),
      userId,
    ).order("id", { ascending: true });

    return unwrapSupabaseData(data, error);
  }
}
