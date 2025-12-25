"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteRentalEndpoint } from "./endpoint";
import { DeleteRentalCommandHandler } from "./handler";
import { SupabaseDeleteRentalRepository } from "./repository";
import { DeleteRentalRequestSchema } from "./request";

export const deleteRentalAction = createActionResponse(
  DeleteRentalRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseDeleteRentalRepository(client);
    const handler = new DeleteRentalCommandHandler(repository);
    return new DeleteRentalEndpoint(handler, auth);
  },
  { successStatus: 204 },
);
