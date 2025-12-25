import type { UpdateIncomeStreamRequest } from "./request";
import type { UpdateIncomeStreamResponse } from "./response";

export type UpdateIncomeStreamCommand = UpdateIncomeStreamRequest & { userId: string };

export type UpdateIncomeStreamRepository = {
  update: (command: UpdateIncomeStreamCommand) => Promise<UpdateIncomeStreamResponse>;
};

export class UpdateIncomeStreamCommandHandler {
  constructor(private readonly repository: UpdateIncomeStreamRepository) {}

  async execute(command: UpdateIncomeStreamCommand): Promise<UpdateIncomeStreamResponse> {
    return this.repository.update(command);
  }
}
