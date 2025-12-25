import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateRentalCommandHandler } from "./handler";
import type { CreateRentalRequest } from "./request";
import type { CreateRentalResponse } from "./response";

export class CreateRentalEndpoint {
  constructor(
    private readonly handler: CreateRentalCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateRentalRequest): Promise<CreateRentalResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
