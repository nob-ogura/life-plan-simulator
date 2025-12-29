import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { GetDashboardSimulationQueryHandler } from "./handler";
import type { GetDashboardSimulationRequest } from "./request";
import type { GetDashboardSimulationResponse } from "./response";

export class GetDashboardSimulationEndpoint {
  constructor(
    private readonly handler: GetDashboardSimulationQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: GetDashboardSimulationRequest): Promise<GetDashboardSimulationResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
