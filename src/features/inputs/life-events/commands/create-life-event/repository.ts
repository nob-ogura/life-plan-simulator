import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";
import type { CreateLifeEventCommand, CreateLifeEventRepository } from "./handler";
import type { CreateLifeEventResponse } from "./response";

export class SupabaseCreateLifeEventRepository implements CreateLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateLifeEventCommand): Promise<CreateLifeEventResponse> {
    const payload = toUserOwnedInsert(command);
    const { data, error } = await this.client.from("life_events").insert(payload).select().single();
    return unwrapSupabaseData(data, error);
  }
}
