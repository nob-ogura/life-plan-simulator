import type { SupabaseClient } from "@supabase/supabase-js";

import { toUserOwnedInsert } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type {
  CreateSimulationSettingsCommand,
  CreateSimulationSettingsRepository,
} from "./handler";
import type { CreateSimulationSettingsResponse } from "./response";

export class SupabaseCreateSimulationSettingsRepository
  implements CreateSimulationSettingsRepository
{
  constructor(private readonly client: SupabaseClient<Database>) {}

  async insert(
    command: CreateSimulationSettingsCommand,
  ): Promise<CreateSimulationSettingsResponse> {
    const { data, error } = await this.client
      .from("simulation_settings")
      .insert(toUserOwnedInsert(command))
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
