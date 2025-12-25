import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateLifeEventCommandHandler } from "./handler";
import type { UpdateLifeEventRequest } from "./request";
import type { UpdateLifeEventResponse } from "./response";

export class UpdateLifeEventEndpoint {
  constructor(
    private readonly handler: UpdateLifeEventCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateLifeEventRequest): Promise<UpdateLifeEventResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
