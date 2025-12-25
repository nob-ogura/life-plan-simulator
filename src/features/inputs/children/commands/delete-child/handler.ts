import type { DeleteChildRequest } from "./request";
import type { DeleteChildResponse } from "./response";

export type DeleteChildCommand = DeleteChildRequest & { userId: string };

export type DeleteChildRepository = {
  delete: (command: DeleteChildCommand) => Promise<DeleteChildResponse>;
};

export class DeleteChildCommandHandler {
  constructor(private readonly repository: DeleteChildRepository) {}

  async execute(command: DeleteChildCommand): Promise<DeleteChildResponse> {
    return this.repository.delete(command);
  }
}
