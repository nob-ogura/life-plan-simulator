"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateSimulationSettingsEndpoint } from "./endpoint";
import { CreateSimulationSettingsCommandHandler } from "./handler";
import { SupabaseCreateSimulationSettingsRepository } from "./repository";
import { CreateSimulationSettingsRequestSchema } from "./request";

export const createSimulationSettingsAction = createAction(
  CreateSimulationSettingsRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseCreateSimulationSettingsRepository(client);
    const handler = new CreateSimulationSettingsCommandHandler(repository);
    return new CreateSimulationSettingsEndpoint(handler, auth);
  },
);
