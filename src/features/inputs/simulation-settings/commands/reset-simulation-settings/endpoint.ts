import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ResetSimulationSettingsCommandHandler } from "./handler";
import type { ResetSimulationSettingsRequest } from "./request";
import type { ResetSimulationSettingsResponse } from "./response";

export class ResetSimulationSettingsEndpoint {
  constructor(
    private readonly handler: ResetSimulationSettingsCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ResetSimulationSettingsRequest): Promise<ResetSimulationSettingsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
