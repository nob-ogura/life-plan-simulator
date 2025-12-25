import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateAssetCommand, CreateAssetRepository } from "./handler";
import type { CreateAssetResponse } from "./response";

export class SupabaseCreateAssetRepository implements CreateAssetRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateAssetCommand): Promise<CreateAssetResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("assets")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
