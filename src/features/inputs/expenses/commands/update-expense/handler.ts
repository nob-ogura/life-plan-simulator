import type { UpdateExpenseRequest } from "./request";
import type { UpdateExpenseResponse } from "./response";

export type UpdateExpenseCommand = UpdateExpenseRequest & { userId: string };

export type UpdateExpenseRepository = {
  update: (command: UpdateExpenseCommand) => Promise<UpdateExpenseResponse>;
};

export class UpdateExpenseCommandHandler {
  constructor(private readonly repository: UpdateExpenseRepository) {}

  async execute(command: UpdateExpenseCommand): Promise<UpdateExpenseResponse> {
    return this.repository.update(command);
  }
}
