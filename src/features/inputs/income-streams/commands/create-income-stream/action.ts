"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateIncomeStreamEndpoint } from "./endpoint";
import { CreateIncomeStreamCommandHandler } from "./handler";
import { SupabaseCreateIncomeStreamRepository } from "./repository";
import { CreateIncomeStreamRequestSchema } from "./request";

export const createIncomeStreamAction = createActionResponse(
  CreateIncomeStreamRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseCreateIncomeStreamRepository(client);
    const handler = new CreateIncomeStreamCommandHandler(repository);
    return new CreateIncomeStreamEndpoint(handler, auth);
  },
);
