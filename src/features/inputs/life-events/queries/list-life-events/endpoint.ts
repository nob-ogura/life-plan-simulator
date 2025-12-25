import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListLifeEventsQueryHandler } from "./handler";
import type { ListLifeEventsRequest } from "./request";
import type { ListLifeEventsResponse } from "./response";

export class ListLifeEventsEndpoint {
  constructor(
    private readonly handler: ListLifeEventsQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListLifeEventsRequest): Promise<ListLifeEventsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
