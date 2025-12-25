import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateIncomeStreamCommandHandler } from "./handler";
import type { UpdateIncomeStreamRequest } from "./request";
import type { UpdateIncomeStreamResponse } from "./response";

export class UpdateIncomeStreamEndpoint {
  constructor(
    private readonly handler: UpdateIncomeStreamCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateIncomeStreamRequest): Promise<UpdateIncomeStreamResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
