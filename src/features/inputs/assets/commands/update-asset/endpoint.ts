import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateAssetCommandHandler } from "./handler";
import type { UpdateAssetRequest } from "./request";
import type { UpdateAssetResponse } from "./response";

export class UpdateAssetEndpoint {
  constructor(
    private readonly handler: UpdateAssetCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateAssetRequest): Promise<UpdateAssetResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
