import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { ListRentalsQuery, ListRentalsRepository } from "./handler";
import type { ListRentalsResponse } from "./response";

export class SupabaseListRentalsRepository implements ListRentalsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async fetch(query: ListRentalsQuery): Promise<ListRentalsResponse> {
    const { userId } = query;
    const { data, error } = await this.client
      .from("rentals")
      .select()
      .eq("user_id", userId)
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }
}
