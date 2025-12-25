import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteLifeEventCommand, DeleteLifeEventRepository } from "./handler";
import type { DeleteLifeEventResponse } from "./response";

export class SupabaseDeleteLifeEventRepository implements DeleteLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteLifeEventCommand): Promise<DeleteLifeEventResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(this.client.from("life_events").delete(), userId, id);

    throwIfSupabaseError(error);

    return { id };
  }
}
