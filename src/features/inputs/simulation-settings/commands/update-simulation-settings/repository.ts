import type { SupabaseClient } from "@supabase/supabase-js";

import { scopeByUserAndId } from "@/features/inputs/shared/infrastructure/user-owned-supabase";
import { unwrapSupabaseData } from "@/shared/cross-cutting/infrastructure/supabase-result";
import type { Database } from "@/types/supabase";

import type {
  UpdateSimulationSettingsCommand,
  UpdateSimulationSettingsRepository,
} from "./handler";
import type { UpdateSimulationSettingsResponse } from "./response";

export class SupabaseUpdateSimulationSettingsRepository
  implements UpdateSimulationSettingsRepository
{
  constructor(private readonly client: SupabaseClient<Database>) {}

  async update(
    command: UpdateSimulationSettingsCommand,
  ): Promise<UpdateSimulationSettingsResponse> {
    const { userId, id, patch } = command;
    const { data, error } = await scopeByUserAndId(
      this.client.from("simulation_settings").update(patch),
      userId,
      id,
    )
      .select()
      .single();

    return unwrapSupabaseData(data, error);
  }
}
