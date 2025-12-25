import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpdateAssetCommand, UpdateAssetRepository } from "./handler";
import type { UpdateAssetResponse } from "./response";

export class SupabaseUpdateAssetRepository implements UpdateAssetRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateAssetCommand): Promise<UpdateAssetResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("assets").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
