"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { UpdateAssetEndpoint } from "./endpoint";
import { UpdateAssetCommandHandler } from "./handler";
import { SupabaseUpdateAssetRepository } from "./repository";
import { UpdateAssetRequestSchema } from "./request";

export const updateAssetAction = createAction(UpdateAssetRequestSchema, () => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);
  const repository = new SupabaseUpdateAssetRepository(client);
  const handler = new UpdateAssetCommandHandler(repository);
  return new UpdateAssetEndpoint(handler, auth);
});
