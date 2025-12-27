import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateSimulationSettingsCommandHandler } from "./handler";
import type { UpdateSimulationSettingsRequest } from "./request";
import type { UpdateSimulationSettingsResponse } from "./response";

export class UpdateSimulationSettingsEndpoint {
  constructor(
    private readonly handler: UpdateSimulationSettingsCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(
    request: UpdateSimulationSettingsRequest,
  ): Promise<UpdateSimulationSettingsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
