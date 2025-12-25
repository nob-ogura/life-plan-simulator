import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { CreateAssetCommand, CreateAssetRepository } from "./handler";
import type { CreateAssetResponse } from "./response";

export class SupabaseCreateAssetRepository implements CreateAssetRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateAssetCommand): Promise<CreateAssetResponse> {
    const { data, error } = await this.client
      .from("assets")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
