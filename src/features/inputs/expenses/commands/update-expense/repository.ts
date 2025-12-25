import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpdateExpenseCommand, UpdateExpenseRepository } from "./handler";
import type { UpdateExpenseResponse } from "./response";

export class SupabaseUpdateExpenseRepository implements UpdateExpenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateExpenseCommand): Promise<UpdateExpenseResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("expenses").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
