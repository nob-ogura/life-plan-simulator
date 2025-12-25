"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListIncomeStreamsEndpoint } from "./endpoint";
import { ListIncomeStreamsQueryHandler } from "./handler";
import { SupabaseListIncomeStreamsRepository } from "./repository";
import { ListIncomeStreamsRequestSchema } from "./request";

export const listIncomeStreamsAction = createActionResponse(ListIncomeStreamsRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListIncomeStreamsRepository(client);
  const handler = new ListIncomeStreamsQueryHandler(repository);
  return new ListIncomeStreamsEndpoint(handler, auth);
});
