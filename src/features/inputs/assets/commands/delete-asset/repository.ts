import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { DeleteAssetCommand, DeleteAssetRepository } from "./handler";
import type { DeleteAssetResponse } from "./response";

export class SupabaseDeleteAssetRepository implements DeleteAssetRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async delete(command: DeleteAssetCommand): Promise<DeleteAssetResponse> {
    const { userId, id } = command;
    const { error } = await this.client.from("assets").delete().eq("id", id).eq("user_id", userId);

    if (error) {
      throw error;
    }

    return { id };
  }
}
