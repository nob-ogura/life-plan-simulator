import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateMortgageCommand, CreateMortgageRepository } from "./handler";
import type { CreateMortgageResponse } from "./response";

export class SupabaseCreateMortgageRepository implements CreateMortgageRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateMortgageCommand): Promise<CreateMortgageResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("mortgages")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
