import type { CreateLifeEventRequest } from "./request";
import type { CreateLifeEventResponse } from "./response";

export type CreateLifeEventCommand = CreateLifeEventRequest & { userId: string };

export type CreateLifeEventRepository = {
  insert: (command: CreateLifeEventCommand) => Promise<CreateLifeEventResponse>;
};

export class CreateLifeEventCommandHandler {
  constructor(private readonly repository: CreateLifeEventRepository) {}

  async execute(command: CreateLifeEventCommand): Promise<CreateLifeEventResponse> {
    return this.repository.insert(command);
  }
}
