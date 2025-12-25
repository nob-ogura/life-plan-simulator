import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateIncomeStreamCommand, UpdateIncomeStreamRepository } from "./handler";
import type { UpdateIncomeStreamResponse } from "./response";

export class SupabaseUpdateIncomeStreamRepository implements UpdateIncomeStreamRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateIncomeStreamCommand): Promise<UpdateIncomeStreamResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("income_streams")
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
