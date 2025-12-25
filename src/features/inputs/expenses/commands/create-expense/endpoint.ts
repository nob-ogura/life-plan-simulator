import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateExpenseCommandHandler } from "./handler";
import type { CreateExpenseRequest } from "./request";
import type { CreateExpenseResponse } from "./response";

export class CreateExpenseEndpoint {
  constructor(
    private readonly handler: CreateExpenseCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateExpenseRequest): Promise<CreateExpenseResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
