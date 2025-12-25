import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListAssetsQuery, ListAssetsRepository } from "./handler";
import type { ListAssetsResponse } from "./response";

export class SupabaseListAssetsRepository implements ListAssetsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListAssetsQuery): Promise<ListAssetsResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(this.client.from("assets").select(), userId).order(
      "id",
      { ascending: true },
    );

    return unwrapSupabaseData(data, error);
  }
}
