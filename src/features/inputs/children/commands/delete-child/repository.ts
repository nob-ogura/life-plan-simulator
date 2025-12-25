import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteChildCommand, DeleteChildRepository } from "./handler";
import type { DeleteChildResponse } from "./response";

export class SupabaseDeleteChildRepository implements DeleteChildRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteChildCommand): Promise<DeleteChildResponse> {
    const { userId, id } = command;
    const { error } = await this.client
      .from("children")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
