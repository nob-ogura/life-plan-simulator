import type { DeleteIncomeStreamRequest } from "./request";
import type { DeleteIncomeStreamResponse } from "./response";

export type DeleteIncomeStreamCommand = DeleteIncomeStreamRequest & { userId: string };

export type DeleteIncomeStreamRepository = {
  delete: (command: DeleteIncomeStreamCommand) => Promise<DeleteIncomeStreamResponse>;
};

export class DeleteIncomeStreamCommandHandler {
  constructor(private readonly repository: DeleteIncomeStreamRepository) {}

  async execute(command: DeleteIncomeStreamCommand): Promise<DeleteIncomeStreamResponse> {
    return this.repository.delete(command);
  }
}
