import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListExpensesQueryHandler } from "./handler";
import type { ListExpensesRequest } from "./request";
import type { ListExpensesResponse } from "./response";

export class ListExpensesEndpoint {
  constructor(
    private readonly handler: ListExpensesQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListExpensesRequest): Promise<ListExpensesResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
