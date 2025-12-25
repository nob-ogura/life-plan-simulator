"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateIncomeStreamEndpoint } from "./endpoint";
import { UpdateIncomeStreamCommandHandler } from "./handler";
import { SupabaseUpdateIncomeStreamRepository } from "./repository";
import { UpdateIncomeStreamRequestSchema } from "./request";

export const updateIncomeStreamAction = createActionResponse(
  UpdateIncomeStreamRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseUpdateIncomeStreamRepository(client);
    const handler = new UpdateIncomeStreamCommandHandler(repository);
    return new UpdateIncomeStreamEndpoint(handler, auth);
  },
);
