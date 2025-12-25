import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateRentalCommand, UpdateRentalRepository } from "./handler";
import type { UpdateRentalResponse } from "./response";

export class SupabaseUpdateRentalRepository implements UpdateRentalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateRentalCommand): Promise<UpdateRentalResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("rentals")
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
