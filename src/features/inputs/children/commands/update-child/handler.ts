import type { UpdateChildRequest } from "./request";
import type { UpdateChildResponse } from "./response";

export type UpdateChildCommand = UpdateChildRequest & { userId: string };

export type UpdateChildRepository = {
  update: (command: UpdateChildCommand) => Promise<UpdateChildResponse>;
};

export class UpdateChildCommandHandler {
  constructor(private readonly repository: UpdateChildRepository) {}

  async execute(command: UpdateChildCommand): Promise<UpdateChildResponse> {
    return this.repository.update(command);
  }
}
