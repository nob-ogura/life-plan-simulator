import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteExpenseCommand, DeleteExpenseRepository } from "./handler";
import type { DeleteExpenseResponse } from "./response";

export class SupabaseDeleteExpenseRepository implements DeleteExpenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteExpenseCommand): Promise<DeleteExpenseResponse> {
    const { userId, id } = command;
    const { error } = await this.client
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
