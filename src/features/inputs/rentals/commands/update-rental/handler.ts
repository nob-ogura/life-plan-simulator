import type { UpdateRentalRequest } from "./request";
import type { UpdateRentalResponse } from "./response";

export type UpdateRentalCommand = UpdateRentalRequest & { userId: string };

export type UpdateRentalRepository = {
  update: (command: UpdateRentalCommand) => Promise<UpdateRentalResponse>;
};

export class UpdateRentalCommandHandler {
  constructor(private readonly repository: UpdateRentalRepository) {}

  async execute(command: UpdateRentalCommand): Promise<UpdateRentalResponse> {
    return this.repository.update(command);
  }
}
