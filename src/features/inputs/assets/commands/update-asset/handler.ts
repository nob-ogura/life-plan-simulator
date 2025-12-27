import { Asset } from "@/shared/domain/assets";
import type { UpdateAssetRequest } from "./request";
import type { UpdateAssetResponse } from "./response";

export type UpdateAssetCommand = UpdateAssetRequest & { userId: string };

export type UpdateAssetRepository = {
  update: (command: UpdateAssetCommand) => Promise<UpdateAssetResponse>;
};

export class UpdateAssetCommandHandler {
  constructor(private readonly repository: UpdateAssetRepository) {}

  async execute(command: UpdateAssetCommand): Promise<UpdateAssetResponse> {
    const patch = Asset.validatePatch(command.patch);
    return this.repository.update({ ...command, patch });
  }
}
