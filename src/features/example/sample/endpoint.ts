import type { ExampleRequest } from "./request";
import type { ExampleResponse } from "./response";
import { ExampleHandler } from "./handler";

// One endpoint = one class.
export class ExampleEndpoint {
  constructor(private readonly handler: ExampleHandler) {}

  async handle(request: ExampleRequest): Promise<ExampleResponse> {
    return this.handler.execute(request);
  }
}
