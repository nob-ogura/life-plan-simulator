import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateIncomeStreamCommandHandler } from "./handler";
import type { CreateIncomeStreamRequest } from "./request";
import type { CreateIncomeStreamResponse } from "./response";

export class CreateIncomeStreamEndpoint {
  constructor(
    private readonly handler: CreateIncomeStreamCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateIncomeStreamRequest): Promise<CreateIncomeStreamResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
