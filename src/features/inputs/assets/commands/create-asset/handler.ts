import type { CreateAssetRequest } from "./request";
import type { CreateAssetResponse } from "./response";

export type CreateAssetCommand = CreateAssetRequest & { userId: string };

export type CreateAssetRepository = {
  insert: (command: CreateAssetCommand) => Promise<CreateAssetResponse>;
};

export class CreateAssetCommandHandler {
  constructor(private readonly repository: CreateAssetRepository) {}

  async execute(command: CreateAssetCommand): Promise<CreateAssetResponse> {
    return this.repository.insert(command);
  }
}
