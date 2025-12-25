import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteChildCommandHandler } from "./handler";
import type { DeleteChildRequest } from "./request";
import type { DeleteChildResponse } from "./response";

export class DeleteChildEndpoint {
  constructor(
    private readonly handler: DeleteChildCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteChildRequest): Promise<DeleteChildResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
