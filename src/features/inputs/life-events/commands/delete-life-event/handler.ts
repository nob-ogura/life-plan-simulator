import type { DeleteLifeEventRequest } from "./request";
import type { DeleteLifeEventResponse } from "./response";

export type DeleteLifeEventCommand = DeleteLifeEventRequest & { userId: string };

export type DeleteLifeEventRepository = {
  delete: (command: DeleteLifeEventCommand) => Promise<DeleteLifeEventResponse>;
};

export class DeleteLifeEventCommandHandler {
  constructor(private readonly repository: DeleteLifeEventRepository) {}

  async execute(command: DeleteLifeEventCommand): Promise<DeleteLifeEventResponse> {
    return this.repository.delete(command);
  }
}
