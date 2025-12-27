"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { CreateAssetEndpoint } from "./endpoint";
import { CreateAssetCommandHandler } from "./handler";
import { SupabaseCreateAssetRepository } from "./repository";
import { CreateAssetRequestSchema } from "./request";

export const createAssetAction = createAction(CreateAssetRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseCreateAssetRepository(client);
  const handler = new CreateAssetCommandHandler(repository);
  return new CreateAssetEndpoint(handler, auth);
});
