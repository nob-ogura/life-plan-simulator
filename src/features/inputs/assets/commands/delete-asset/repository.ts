import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { throwIfSupabaseError } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { DeleteAssetCommand, DeleteAssetRepository } from "./handler";
import type { DeleteAssetResponse } from "./response";

export class SupabaseDeleteAssetRepository implements DeleteAssetRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteAssetCommand): Promise<DeleteAssetResponse> {
    const { userId, id } = command;
    const { error } = await scopeByUserAndId(this.client.from("assets").delete(), userId, id);

    throwIfSupabaseError(error);

    return { id };
  }
}
