import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteExpenseCommand, DeleteExpenseRepository } from "./handler";
import type { DeleteExpenseResponse } from "./response";

export class SupabaseDeleteExpenseRepository implements DeleteExpenseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteExpenseCommand): Promise<DeleteExpenseResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(this.client.from("expenses").delete(), userId, id);

    throwIfSupabaseError(error);

    return { id };
  }
}
