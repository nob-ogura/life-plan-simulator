import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteIncomeStreamCommand, DeleteIncomeStreamRepository } from "./handler";
import type { DeleteIncomeStreamResponse } from "./response";

export class SupabaseDeleteIncomeStreamRepository implements DeleteIncomeStreamRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteIncomeStreamCommand): Promise<DeleteIncomeStreamResponse> {
    const { userId, id } = command;
    const { error } = await this.client
      .from("income_streams")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
