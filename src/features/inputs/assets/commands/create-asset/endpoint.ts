import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateAssetCommandHandler } from "./handler";
import type { CreateAssetRequest } from "./request";
import type { CreateAssetResponse } from "./response";

export class CreateAssetEndpoint {
  constructor(
    private readonly handler: CreateAssetCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateAssetRequest): Promise<CreateAssetResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
