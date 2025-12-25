import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateLifeEventCommand, UpdateLifeEventRepository } from "./handler";
import type { UpdateLifeEventResponse } from "./response";

export class SupabaseUpdateLifeEventRepository implements UpdateLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateLifeEventCommand): Promise<UpdateLifeEventResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("life_events")
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
