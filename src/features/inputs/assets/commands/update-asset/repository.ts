import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { UpdateAssetCommand, UpdateAssetRepository } from "./handler";
import type { UpdateAssetResponse } from "./response";

export class SupabaseUpdateAssetRepository implements UpdateAssetRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateAssetCommand): Promise<UpdateAssetResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await this.client
      .from("assets")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
