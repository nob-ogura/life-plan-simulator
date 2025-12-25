import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteAssetCommandHandler } from "./handler";
import type { DeleteAssetRequest } from "./request";
import type { DeleteAssetResponse } from "./response";

export class DeleteAssetEndpoint {
  constructor(
    private readonly handler: DeleteAssetCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteAssetRequest): Promise<DeleteAssetResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
