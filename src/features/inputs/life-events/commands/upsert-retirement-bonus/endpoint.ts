import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpsertRetirementBonusCommandHandler } from "./handler";
import type { UpsertRetirementBonusRequest } from "./request";
import type { UpsertRetirementBonusResponse } from "./response";

export class UpsertRetirementBonusEndpoint {
  constructor(
    private readonly handler: UpsertRetirementBonusCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpsertRetirementBonusRequest): Promise<UpsertRetirementBonusResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
