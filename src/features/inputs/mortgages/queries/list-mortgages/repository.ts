import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListMortgagesQuery, ListMortgagesRepository } from "./handler";
import type { ListMortgagesResponse } from "./response";

export class SupabaseListMortgagesRepository implements ListMortgagesRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListMortgagesQuery): Promise<ListMortgagesResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(
      this.client.from("mortgages").select(),
      userId,
    ).order("id", { ascending: true });

    return unwrapSupabaseData(data, error);
  }
}
