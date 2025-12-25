import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteRentalCommand, DeleteRentalRepository } from "./handler";
import type { DeleteRentalResponse } from "./response";

export class SupabaseDeleteRentalRepository implements DeleteRentalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteRentalCommand): Promise<DeleteRentalResponse> {
    const { userId, id } = command;
    const { error } = await this.client.from("rentals").delete().eq("id", id).eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
