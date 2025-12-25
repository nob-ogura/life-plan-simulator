import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteExpenseCommandHandler } from "./handler";
import type { DeleteExpenseRequest } from "./request";
import type { DeleteExpenseResponse } from "./response";

export class DeleteExpenseEndpoint {
  constructor(
    private readonly handler: DeleteExpenseCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteExpenseRequest): Promise<DeleteExpenseResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
