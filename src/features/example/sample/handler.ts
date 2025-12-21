import type { ExampleRequest } from "./request";
import type { ExampleResponse } from "./response";

export class ExampleHandler {
  async execute(_request: ExampleRequest): Promise<ExampleResponse> {
    return { ok: true };
  }
}
