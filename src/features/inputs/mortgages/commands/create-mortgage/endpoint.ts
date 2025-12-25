import type { AuthSession } from "@/shared/cross-cutting/auth/server-auth";

import type { CreateMortgageCommandHandler } from "./handler";
import type { CreateMortgageRequest } from "./request";
import type { CreateMortgageResponse } from "./response";

export class CreateMortgageEndpoint {
  constructor(
    private readonly handler: CreateMortgageCommandHandler,
    private readonly auth: AuthSession,
  ) {}

  async handle(request: CreateMortgageRequest): Promise<CreateMortgageResponse> {
    const userId = await this.auth.requireUserId();
    return this.handler.execute({ userId, ...request });
  }
}
