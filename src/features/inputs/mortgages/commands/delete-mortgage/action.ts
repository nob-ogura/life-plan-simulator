"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteMortgageEndpoint } from "./endpoint";
import { DeleteMortgageCommandHandler } from "./handler";
import { SupabaseDeleteMortgageRepository } from "./repository";
import { DeleteMortgageRequestSchema } from "./request";

export const deleteMortgageAction = createActionResponse(
  DeleteMortgageRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseDeleteMortgageRepository(client);
    const handler = new DeleteMortgageCommandHandler(repository);
    return new DeleteMortgageEndpoint(handler, auth);
  },
  { successStatus: 204 },
);
