import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListAssetsQueryHandler } from "./handler";
import type { ListAssetsRequest } from "./request";
import type { ListAssetsResponse } from "./response";

export class ListAssetsEndpoint {
  constructor(
    private readonly handler: ListAssetsQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListAssetsRequest): Promise<ListAssetsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
