import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteIncomeStreamCommandHandler } from "./handler";
import type { DeleteIncomeStreamRequest } from "./request";
import type { DeleteIncomeStreamResponse } from "./response";

export class DeleteIncomeStreamEndpoint {
  constructor(
    private readonly handler: DeleteIncomeStreamCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteIncomeStreamRequest): Promise<DeleteIncomeStreamResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
