import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListExpensesQuery, ListExpensesRepository } from "./handler";
import type { ListExpensesResponse } from "./response";

export class SupabaseListExpensesRepository implements ListExpensesRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListExpensesQuery): Promise<ListExpensesResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(
      this.client.from("expenses").select(),
      userId,
    ).order("id", { ascending: true });

    return unwrapSupabaseData(data, error);
  }
}
