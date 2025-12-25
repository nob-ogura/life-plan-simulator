import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteLifeEventCommandHandler } from "./handler";
import type { DeleteLifeEventRequest } from "./request";
import type { DeleteLifeEventResponse } from "./response";

export class DeleteLifeEventEndpoint {
  constructor(
    private readonly handler: DeleteLifeEventCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteLifeEventRequest): Promise<DeleteLifeEventResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
