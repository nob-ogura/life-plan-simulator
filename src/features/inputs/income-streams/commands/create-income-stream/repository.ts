import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateIncomeStreamCommand, CreateIncomeStreamRepository } from "./handler";
import type { CreateIncomeStreamResponse } from "./response";

export class SupabaseCreateIncomeStreamRepository implements CreateIncomeStreamRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateIncomeStreamCommand): Promise<CreateIncomeStreamResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("income_streams")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
