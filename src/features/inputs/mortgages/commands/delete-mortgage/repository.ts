import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteMortgageCommand, DeleteMortgageRepository } from "./handler";
import type { DeleteMortgageResponse } from "./response";

export class SupabaseDeleteMortgageRepository implements DeleteMortgageRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteMortgageCommand): Promise<DeleteMortgageResponse> {
    const { userId, id } = command;
    const { error } = await this.client
      .from("mortgages")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
