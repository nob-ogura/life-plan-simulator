import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteChildCommand, DeleteChildRepository } from "./handler";
import type { DeleteChildResponse } from "./response";

export class SupabaseDeleteChildRepository implements DeleteChildRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteChildCommand): Promise<DeleteChildResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(this.client.from("children").delete(), userId, id);

    throwIfSupabaseError(error);

    return { id };
  }
}
