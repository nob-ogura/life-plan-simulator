import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ListRentalsQuery, ListRentalsRepository } from "./handler";
import type { ListRentalsResponse } from "./response";

export class SupabaseListRentalsRepository implements ListRentalsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListRentalsQuery): Promise<ListRentalsResponse> {
    const { userId } = query;
    const { data, error } = await scopeByUserId(this.client.from("rentals").select(), userId).order(
      "id",
      { ascending: true },
    );

    return unwrapSupabaseData(data, error);
  }
}
