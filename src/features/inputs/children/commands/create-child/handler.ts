import type { CreateChildRequest } from "./request";
import type { CreateChildResponse } from "./response";

export type CreateChildCommand = CreateChildRequest & { userId: string };

export type CreateChildRepository = {
  insert: (command: CreateChildCommand) => Promise<CreateChildResponse>;
};

export class CreateChildCommandHandler {
  constructor(private readonly repository: CreateChildRepository) {}

  async execute(command: CreateChildCommand): Promise<CreateChildResponse> {
    return this.repository.insert(command);
  }
}
