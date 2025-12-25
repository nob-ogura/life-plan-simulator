import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateRentalCommand, CreateRentalRepository } from "./handler";
import type { CreateRentalResponse } from "./response";

export class SupabaseCreateRentalRepository implements CreateRentalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateRentalCommand): Promise<CreateRentalResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("rentals")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
