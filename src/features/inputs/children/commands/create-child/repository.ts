import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { CreateChildCommand, CreateChildRepository } from "./handler";
import type { CreateChildResponse } from "./response";

export class SupabaseCreateChildRepository implements CreateChildRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateChildCommand): Promise<CreateChildResponse> {
    const { data, error } = await this.client
      .from("children")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
