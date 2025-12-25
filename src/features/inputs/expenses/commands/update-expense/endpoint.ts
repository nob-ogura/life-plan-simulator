import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateExpenseCommandHandler } from "./handler";
import type { UpdateExpenseRequest } from "./request";
import type { UpdateExpenseResponse } from "./response";

export class UpdateExpenseEndpoint {
  constructor(
    private readonly handler: UpdateExpenseCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateExpenseRequest): Promise<UpdateExpenseResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
