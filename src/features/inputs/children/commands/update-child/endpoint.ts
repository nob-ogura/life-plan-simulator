import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateChildCommandHandler } from "./handler";
import type { UpdateChildRequest } from "./request";
import type { UpdateChildResponse } from "./response";

export class UpdateChildEndpoint {
  constructor(
    private readonly handler: UpdateChildCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateChildRequest): Promise<UpdateChildResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
