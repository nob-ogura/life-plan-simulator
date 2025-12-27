"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateSimulationSettingsEndpoint } from "./endpoint";
import { UpdateSimulationSettingsCommandHandler } from "./handler";
import { SupabaseUpdateSimulationSettingsRepository } from "./repository";
import { UpdateSimulationSettingsRequestSchema } from "./request";

export const updateSimulationSettingsAction = createAction(
  UpdateSimulationSettingsRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseUpdateSimulationSettingsRepository(client);
    const handler = new UpdateSimulationSettingsCommandHandler(repository);
    return new UpdateSimulationSettingsEndpoint(handler, auth);
  },
);
