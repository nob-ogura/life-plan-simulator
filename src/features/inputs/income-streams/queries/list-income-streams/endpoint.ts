import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListIncomeStreamsQueryHandler } from "./handler";
import type { ListIncomeStreamsRequest } from "./request";
import type { ListIncomeStreamsResponse } from "./response";

export class ListIncomeStreamsEndpoint {
  constructor(
    private readonly handler: ListIncomeStreamsQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListIncomeStreamsRequest): Promise<ListIncomeStreamsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
