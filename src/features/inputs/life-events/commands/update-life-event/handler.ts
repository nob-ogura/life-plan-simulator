import type { UpdateLifeEventRequest } from "./request";
import type { UpdateLifeEventResponse } from "./response";

export type UpdateLifeEventCommand = UpdateLifeEventRequest & { userId: string };

export type UpdateLifeEventRepository = {
  update: (command: UpdateLifeEventCommand) => Promise<UpdateLifeEventResponse>;
};

export class UpdateLifeEventCommandHandler {
  constructor(private readonly repository: UpdateLifeEventRepository) {}

  async execute(command: UpdateLifeEventCommand): Promise<UpdateLifeEventResponse> {
    return this.repository.update(command);
  }
}
