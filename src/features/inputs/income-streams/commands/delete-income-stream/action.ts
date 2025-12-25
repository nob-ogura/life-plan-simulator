"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteIncomeStreamEndpoint } from "./endpoint";
import { DeleteIncomeStreamCommandHandler } from "./handler";
import { SupabaseDeleteIncomeStreamRepository } from "./repository";
import { DeleteIncomeStreamRequestSchema } from "./request";

export const deleteIncomeStreamAction = createActionResponse(
  DeleteIncomeStreamRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseDeleteIncomeStreamRepository(client);
    const handler = new DeleteIncomeStreamCommandHandler(repository);
    return new DeleteIncomeStreamEndpoint(handler, auth);
  },
  { successStatus: 204 },
);
