import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";
import {
  canRetryWithoutStopAfterAge,
  omitStopAfterAge,
} from "../../infrastructure/stop-after-age-compat";
import type { CreateLifeEventCommand, CreateLifeEventRepository } from "./handler";
import type { CreateLifeEventResponse } from "./response";

export class SupabaseCreateLifeEventRepository implements CreateLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateLifeEventCommand): Promise<CreateLifeEventResponse> {
    const payload = toUserOwnedInsert(command);
    const { data, error } = await this.client.from("life_events").insert(payload).select().single();

    if (canRetryWithoutStopAfterAge(error, payload.stop_after_age)) {
      const { data: retryData, error: retryError } = await this.client
        .from("life_events")
        .insert(omitStopAfterAge(payload))
        .select()
        .single();

      return unwrapSupabaseData(retryData, retryError);
    }

    return unwrapSupabaseData(data, error);
  }
}
