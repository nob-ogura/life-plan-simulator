import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateLifeEventCommandHandler } from "./handler";
import type { CreateLifeEventRequest } from "./request";
import type { CreateLifeEventResponse } from "./response";

export class CreateLifeEventEndpoint {
  constructor(
    private readonly handler: CreateLifeEventCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateLifeEventRequest): Promise<CreateLifeEventResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
