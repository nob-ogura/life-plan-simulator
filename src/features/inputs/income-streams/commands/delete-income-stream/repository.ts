import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteIncomeStreamCommand, DeleteIncomeStreamRepository } from "./handler";
import type { DeleteIncomeStreamResponse } from "./response";

export class SupabaseDeleteIncomeStreamRepository implements DeleteIncomeStreamRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteIncomeStreamCommand): Promise<DeleteIncomeStreamResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(
      this.client.from("income_streams").delete(),
      userId,
      id,
    );

    throwIfSupabaseError(error);

    return { id };
  }
}
