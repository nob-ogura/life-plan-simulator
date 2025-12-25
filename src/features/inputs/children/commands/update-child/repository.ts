import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateChildCommand, UpdateChildRepository } from "./handler";
import type { UpdateChildResponse } from "./response";

export class SupabaseUpdateChildRepository implements UpdateChildRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateChildCommand): Promise<UpdateChildResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("children")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
