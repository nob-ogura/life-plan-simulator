import type { CreateRentalRequest } from "./request";
import type { CreateRentalResponse } from "./response";

export type CreateRentalCommand = CreateRentalRequest & { userId: string };

export type CreateRentalRepository = {
  insert: (command: CreateRentalCommand) => Promise<CreateRentalResponse>;
};

export class CreateRentalCommandHandler {
  constructor(private readonly repository: CreateRentalRepository) {}

  async execute(command: CreateRentalCommand): Promise<CreateRentalResponse> {
    return this.repository.insert(command);
  }
}
