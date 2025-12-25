import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteMortgageCommand, DeleteMortgageRepository } from "./handler";
import type { DeleteMortgageResponse } from "./response";

export class SupabaseDeleteMortgageRepository implements DeleteMortgageRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteMortgageCommand): Promise<DeleteMortgageResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(this.client.from("mortgages").delete(), userId, id);

    throwIfSupabaseError(error);

    return { id };
  }
}
