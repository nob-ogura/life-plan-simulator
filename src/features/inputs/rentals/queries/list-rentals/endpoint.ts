import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { ListRentalsQueryHandler } from "./handler";
import type { ListRentalsRequest } from "./request";
import type { ListRentalsResponse } from "./response";

export class ListRentalsEndpoint {
  constructor(
    private readonly handler: ListRentalsQueryHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(_request: ListRentalsRequest): Promise<ListRentalsResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId });
  }
}
