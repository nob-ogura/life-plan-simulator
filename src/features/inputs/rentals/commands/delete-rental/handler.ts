import type { DeleteRentalRequest } from "./request";
import type { DeleteRentalResponse } from "./response";

export type DeleteRentalCommand = DeleteRentalRequest & { userId: string };

export type DeleteRentalRepository = {
  delete: (command: DeleteRentalCommand) => Promise<DeleteRentalResponse>;
};

export class DeleteRentalCommandHandler {
  constructor(private readonly repository: DeleteRentalRepository) {}

  async execute(command: DeleteRentalCommand): Promise<DeleteRentalResponse> {
    return this.repository.delete(command);
  }
}
