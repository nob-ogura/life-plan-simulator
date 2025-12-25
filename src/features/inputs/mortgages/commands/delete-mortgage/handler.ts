import type { DeleteMortgageRequest } from "./request";
import type { DeleteMortgageResponse } from "./response";

export type DeleteMortgageCommand = DeleteMortgageRequest & { userId: string };

export type DeleteMortgageRepository = {
  delete: (command: DeleteMortgageCommand) => Promise<DeleteMortgageResponse>;
};

export class DeleteMortgageCommandHandler {
  constructor(private readonly repository: DeleteMortgageRepository) {}

  async execute(command: DeleteMortgageCommand): Promise<DeleteMortgageResponse> {
    return this.repository.delete(command);
  }
}
