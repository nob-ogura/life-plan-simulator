"use server";

import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";

import { DeleteAssetEndpoint } from "./endpoint";
import { DeleteAssetCommandHandler } from "./handler";
import { SupabaseDeleteAssetRepository } from "./repository";
import { DeleteAssetRequestSchema } from "./request";

export const deleteAssetAction = createActionResponse(
  DeleteAssetRequestSchema,
  () => {
    const client = createServerSupabaseClient();
    const auth = createServerAuthSession(client);
    const repository = new SupabaseDeleteAssetRepository(client);
    const handler = new DeleteAssetCommandHandler(repository);
    return new DeleteAssetEndpoint(handler, auth);
  },
  { successStatus: 204 },
);
