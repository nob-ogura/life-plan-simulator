import type { CreateMortgageRequest } from "./request";
import type { CreateMortgageResponse } from "./response";

export type CreateMortgageCommand = CreateMortgageRequest & { userId: string };

export type CreateMortgageRepository = {
  insert: (command: CreateMortgageCommand) => Promise<CreateMortgageResponse>;
};

export class CreateMortgageCommandHandler {
  constructor(private readonly repository: CreateMortgageRepository) {}

  async execute(command: CreateMortgageCommand): Promise<CreateMortgageResponse> {
    return this.repository.insert(command);
  }
}
