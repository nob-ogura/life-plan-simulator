"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListLifeEventsEndpoint } from "./endpoint";
import { ListLifeEventsQueryHandler } from "./handler";
import { SupabaseListLifeEventsRepository } from "./repository";
import { ListLifeEventsRequestSchema } from "./request";

export const listLifeEventsAction = createActionResponse(ListLifeEventsRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListLifeEventsRepository(client);
  const handler = new ListLifeEventsQueryHandler(repository);
  return new ListLifeEventsEndpoint(handler, auth);
});
