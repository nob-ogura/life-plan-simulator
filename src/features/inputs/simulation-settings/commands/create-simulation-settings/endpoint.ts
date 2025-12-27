import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateSimulationSettingsCommandHandler } from "./handler";
import type { CreateSimulationSettingsRequest } from "./request";
import type { CreateSimulationSettingsResponse } from "./response";

export class CreateSimulationSettingsEndpoint {
  constructor(
    private readonly handler: CreateSimulationSettingsCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(
    request: CreateSimulationSettingsRequest,
  ): Promise<CreateSimulationSettingsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
