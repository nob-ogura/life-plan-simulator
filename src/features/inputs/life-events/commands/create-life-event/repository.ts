import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

import type { CreateLifeEventCommand, CreateLifeEventRepository } from "./handler";
import type { CreateLifeEventResponse } from "./response";

export class SupabaseCreateLifeEventRepository implements CreateLifeEventRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(command: CreateLifeEventCommand): Promise<CreateLifeEventResponse> {
    const { userId, ...payload } = command;
    const { data, error } = await this.client
      .from("life_events")
      .insert({ ...payload, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
