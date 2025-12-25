import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteRentalCommand, DeleteRentalRepository } from "./handler";
import type { DeleteRentalResponse } from "./response";

export class SupabaseDeleteRentalRepository implements DeleteRentalRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteRentalCommand): Promise<DeleteRentalResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(this.client.from("rentals").delete(), userId, id);

    throwIfSupabaseError(error);

    return { id };
  }
}
