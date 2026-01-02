"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ResetSimulationSettingsEndpoint } from "./endpoint";
import { ResetSimulationSettingsCommandHandler } from "./handler";
import { SupabaseResetSimulationSettingsRepository } from "./repository";
import { ResetSimulationSettingsRequestSchema } from "./request";

export const resetSimulationSettingsAction = createAction(
  ResetSimulationSettingsRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseResetSimulationSettingsRepository(client);
    const handler = new ResetSimulationSettingsCommandHandler(repository);
    return new ResetSimulationSettingsEndpoint(handler, auth);
  },
);
