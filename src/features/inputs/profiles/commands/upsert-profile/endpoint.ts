import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpsertProfileCommandHandler } from "./handler";
import type { UpsertProfileRequest } from "./request";
import type { UpsertProfileResponse } from "./response";

export class UpsertProfileEndpoint {
  constructor(
    private readonly handler: UpsertProfileCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpsertProfileRequest): Promise<UpsertProfileResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
