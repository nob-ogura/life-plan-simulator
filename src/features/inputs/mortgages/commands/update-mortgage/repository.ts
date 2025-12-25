import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateMortgageCommand, UpdateMortgageRepository } from "./handler";
import type { UpdateMortgageResponse } from "./response";

export class SupabaseUpdateMortgageRepository implements UpdateMortgageRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateMortgageCommand): Promise<UpdateMortgageResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("mortgages")
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
