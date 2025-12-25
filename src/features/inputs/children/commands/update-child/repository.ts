import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { UpdateChildCommand, UpdateChildRepository } from "./handler";
import type { UpdateChildResponse } from "./response";

export class SupabaseUpdateChildRepository implements UpdateChildRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateChildCommand): Promise<UpdateChildResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("children").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
