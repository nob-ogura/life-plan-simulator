import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { BulkSaveIncomeStreamsCommandHandler } from "./handler";
import type { BulkSaveIncomeStreamsRequest } from "./request";
import type { BulkSaveIncomeStreamsResponse } from "./response";

export class BulkSaveIncomeStreamsEndpoint {
  constructor(
    private readonly handler: BulkSaveIncomeStreamsCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: BulkSaveIncomeStreamsRequest): Promise<BulkSaveIncomeStreamsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
