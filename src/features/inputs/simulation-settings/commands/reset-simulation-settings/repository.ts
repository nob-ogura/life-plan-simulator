import type { SupabaseClient } from "@supabase/supabase-js";

import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type { ResetSimulationSettingsCommand, ResetSimulationSettingsRepository } from "./handler";
import type { ResetSimulationSettingsResponse } from "./response";

export class SupabaseResetSimulationSettingsRepository
  implements ResetSimulationSettingsRepository
{
  constructor(private readonly client: SupabaseClient<Database>) {}

  async reset(command: ResetSimulationSettingsCommand): Promise<ResetSimulationSettingsResponse> {
    if (!command.userId) {
      throw new Error("User not found.");
    }

    const { data, error } = await this.client.rpc("reset_simulation_settings_defaults");
    return unwrapSupabaseData(data, error);
  }
}
