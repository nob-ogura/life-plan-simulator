import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateExpenseCommand, UpdateExpenseRepository } from "./handler";
import type { UpdateExpenseResponse } from "./response";

export class SupabaseUpdateExpenseRepository implements UpdateExpenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateExpenseCommand): Promise<UpdateExpenseResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("expenses")
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
