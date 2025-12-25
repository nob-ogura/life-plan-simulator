import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { CreateExpenseCommand, CreateExpenseRepository } from "./handler";
import type { CreateExpenseResponse } from "./response";

export class SupabaseCreateExpenseRepository implements CreateExpenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateExpenseCommand): Promise<CreateExpenseResponse> {
    const { data, error } = await this.client
      .from("expenses")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
