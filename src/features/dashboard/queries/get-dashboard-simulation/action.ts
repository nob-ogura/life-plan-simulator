"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { GetDashboardSimulationEndpoint } from "./endpoint";
import { GetDashboardSimulationQueryHandler } from "./handler";
import { SupabaseGetDashboardSimulationRepository } from "./repository";
import { GetDashboardSimulationRequestSchema } from "./request";

export const getDashboardSimulationAction = createActionResponse(
  GetDashboardSimulationRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseGetDashboardSimulationRepository(client);
    const handler = new GetDashboardSimulationQueryHandler(repository);
    return new GetDashboardSimulationEndpoint(handler, auth);
  },
);
