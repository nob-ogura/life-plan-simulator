import type { CreateIncomeStreamRequest } from "./request";
import type { CreateIncomeStreamResponse } from "./response";

export type CreateIncomeStreamCommand = CreateIncomeStreamRequest & { userId: string };

export type CreateIncomeStreamRepository = {
  insert: (command: CreateIncomeStreamCommand) => Promise<CreateIncomeStreamResponse>;
};

export class CreateIncomeStreamCommandHandler {
  constructor(private readonly repository: CreateIncomeStreamRepository) {}

  async execute(command: CreateIncomeStreamCommand): Promise<CreateIncomeStreamResponse> {
    return this.repository.insert(command);
  }
}
