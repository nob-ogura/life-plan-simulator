import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateExpenseCommand, CreateExpenseRepository } from "./handler";
import type { CreateExpenseResponse } from "./response";

export class SupabaseCreateExpenseRepository implements CreateExpenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateExpenseCommand): Promise<CreateExpenseResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("expenses")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
