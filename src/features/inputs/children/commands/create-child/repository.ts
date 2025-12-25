import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateChildCommand, CreateChildRepository } from "./handler";
import type { CreateChildResponse } from "./response";

export class SupabaseCreateChildRepository implements CreateChildRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateChildCommand): Promise<CreateChildResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("children")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
