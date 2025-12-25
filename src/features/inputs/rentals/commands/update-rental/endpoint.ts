import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateRentalCommandHandler } from "./handler";
import type { UpdateRentalRequest } from "./request";
import type { UpdateRentalResponse } from "./response";

export class UpdateRentalEndpoint {
  constructor(
    private readonly handler: UpdateRentalCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateRentalRequest): Promise<UpdateRentalResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
