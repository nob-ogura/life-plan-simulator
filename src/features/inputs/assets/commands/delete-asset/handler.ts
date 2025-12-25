import type { DeleteAssetRequest } from "./request";
import type { DeleteAssetResponse } from "./response";

export type DeleteAssetCommand = DeleteAssetRequest & { userId: string };

export type DeleteAssetRepository = {
  delete: (command: DeleteAssetCommand) => Promise<DeleteAssetResponse>;
};

export class DeleteAssetCommandHandler {
  constructor(private readonly repository: DeleteAssetRepository) {}

  async execute(command: DeleteAssetCommand): Promise<DeleteAssetResponse> {
    return this.repository.delete(command);
  }
}
