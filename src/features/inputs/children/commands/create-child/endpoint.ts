import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateChildCommandHandler } from "./handler";
import type { CreateChildRequest } from "./request";
import type { CreateChildResponse } from "./response";

export class CreateChildEndpoint {
  constructor(
    private readonly handler: CreateChildCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateChildRequest): Promise<CreateChildResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
