"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteLifeEventEndpoint } from "./endpoint";
import { DeleteLifeEventCommandHandler } from "./handler";
import { SupabaseDeleteLifeEventRepository } from "./repository";
import { DeleteLifeEventRequestSchema } from "./request";

export const deleteLifeEventAction = createActionResponse(
  DeleteLifeEventRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseDeleteLifeEventRepository(client);
    const handler = new DeleteLifeEventCommandHandler(repository);
    return new DeleteLifeEventEndpoint(handler, auth);
  },
  { successStatus: 204 },
);
