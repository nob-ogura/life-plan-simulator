import type { ExampleRequest } from "./request";
import type { ExampleResponse } from "./response";
import { ExampleHandler } from "./handler";

// One endpoint = one class. Keep input/auth only and delegate to handler.
export class ExampleEndpoint {
  constructor(private readonly handler: ExampleHandler) {}

  async handle(request: ExampleRequest): Promise<ExampleResponse> {
    return this.handler.execute(request);
  }
}
