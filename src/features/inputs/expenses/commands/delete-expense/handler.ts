import type { DeleteExpenseRequest } from "./request";
import type { DeleteExpenseResponse } from "./response";

export type DeleteExpenseCommand = DeleteExpenseRequest & { userId: string };

export type DeleteExpenseRepository = {
  delete: (command: DeleteExpenseCommand) => Promise<DeleteExpenseResponse>;
};

export class DeleteExpenseCommandHandler {
  constructor(private readonly repository: DeleteExpenseRepository) {}

  async execute(command: DeleteExpenseCommand): Promise<DeleteExpenseResponse> {
    return this.repository.delete(command);
  }
}
