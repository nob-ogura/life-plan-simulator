import type { CreateExpenseRequest } from "./request";
import type { CreateExpenseResponse } from "./response";

export type CreateExpenseCommand = CreateExpenseRequest & { userId: string };

export type CreateExpenseRepository = {
  insert: (command: CreateExpenseCommand) => Promise<CreateExpenseResponse>;
};

export class CreateExpenseCommandHandler {
  constructor(private readonly repository: CreateExpenseRepository) {}

  async execute(command: CreateExpenseCommand): Promise<CreateExpenseResponse> {
    return this.repository.insert(command);
  }
}
