import type { UpdateMortgageRequest } from "./request";
import type { UpdateMortgageResponse } from "./response";

export type UpdateMortgageCommand = UpdateMortgageRequest & { userId: string };

export type UpdateMortgageRepository = {
  update: (command: UpdateMortgageCommand) => Promise<UpdateMortgageResponse>;
};

export class UpdateMortgageCommandHandler {
  constructor(private readonly repository: UpdateMortgageRepository) {}

  async execute(command: UpdateMortgageCommand): Promise<UpdateMortgageResponse> {
    return this.repository.update(command);
  }
}
