import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { UpdateMortgageCommandHandler } from "./handler";
import type { UpdateMortgageRequest } from "./request";
import type { UpdateMortgageResponse } from "./response";

export class UpdateMortgageEndpoint {
  constructor(
    private readonly handler: UpdateMortgageCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: UpdateMortgageRequest): Promise<UpdateMortgageResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
