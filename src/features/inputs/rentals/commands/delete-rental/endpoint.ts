import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteRentalCommandHandler } from "./handler";
import type { DeleteRentalRequest } from "./request";
import type { DeleteRentalResponse } from "./response";

export class DeleteRentalEndpoint {
  constructor(
    private readonly handler: DeleteRentalCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteRentalRequest): Promise<DeleteRentalResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
