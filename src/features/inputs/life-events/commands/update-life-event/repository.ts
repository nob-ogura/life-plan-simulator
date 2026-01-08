import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";
import type { UpdateLifeEventCommand, UpdateLifeEventRepository } from "./handler";
import type { UpdateLifeEventResponse } from "./response";

export class SupabaseUpdateLifeEventRepository implements UpdateLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(command: UpdateLifeEventCommand): Promise<UpdateLifeEventResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("life_events").update(patch),
      userId,
      id,
    )
      .select()
      .single();
    return unwrapSupabaseData(data, error);
  }
}
