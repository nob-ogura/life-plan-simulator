import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { DeleteMortgageCommandHandler } from "./handler";
import type { DeleteMortgageRequest } from "./request";
import type { DeleteMortgageResponse } from "./response";

export class DeleteMortgageEndpoint {
  constructor(
    private readonly handler: DeleteMortgageCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: DeleteMortgageRequest): Promise<DeleteMortgageResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
