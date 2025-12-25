import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteLifeEventCommand, DeleteLifeEventRepository } from "./handler";
import type { DeleteLifeEventResponse } from "./response";

export class SupabaseDeleteLifeEventRepository implements DeleteLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteLifeEventCommand): Promise<DeleteLifeEventResponse> {
    const { userId, id } = command;
    const { error } = await this.client
      .from("life_events")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
