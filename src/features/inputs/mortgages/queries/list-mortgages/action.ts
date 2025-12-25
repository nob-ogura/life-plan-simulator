"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListMortgagesEndpoint } from "./endpoint";
import { ListMortgagesQueryHandler } from "./handler";
import { SupabaseListMortgagesRepository } from "./repository";
import { ListMortgagesRequestSchema } from "./request";

export const listMortgagesAction = createActionResponse(ListMortgagesRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListMortgagesRepository(client);
  const handler = new ListMortgagesQueryHandler(repository);
  return new ListMortgagesEndpoint(handler, auth);
});
