import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListChildrenQueryHandler } from "./handler";
import type { ListChildrenRequest } from "./request";
import type { ListChildrenResponse } from "./response";

export class ListChildrenEndpoint {
  constructor(
    private readonly handler: ListChildrenQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListChildrenRequest): Promise<ListChildrenResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
