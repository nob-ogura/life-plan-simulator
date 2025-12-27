"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpsertProfileEndpoint } from "./endpoint";
import { UpsertProfileCommandHandler } from "./handler";
import { SupabaseUpsertProfileRepository } from "./repository";
import { UpsertProfileRequestSchema } from "./request";

export const upsertProfileAction = createAction(UpsertProfileRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpsertProfileRepository(client);
  const handler = new UpsertProfileCommandHandler(repository);
  return new UpsertProfileEndpoint(handler, auth);
});
