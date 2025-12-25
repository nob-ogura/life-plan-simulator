"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { ListRentalsEndpoint } from "./endpoint";
import { ListRentalsQueryHandler } from "./handler";
import { SupabaseListRentalsRepository } from "./repository";
import { ListRentalsRequestSchema } from "./request";

export const listRentalsAction = createActionResponse(ListRentalsRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseListRentalsRepository(client);
  const handler = new ListRentalsQueryHandler(repository);
  return new ListRentalsEndpoint(handler, auth);
});
