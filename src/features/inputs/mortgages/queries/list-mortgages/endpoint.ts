import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListMortgagesQueryHandler } from "./handler";
import type { ListMortgagesRequest } from "./request";
import type { ListMortgagesResponse } from "./response";

export class ListMortgagesEndpoint {
  constructor(
    private readonly handler: ListMortgagesQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListMortgagesRequest): Promise<ListMortgagesResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
