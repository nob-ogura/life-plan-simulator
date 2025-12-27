import { Asset } from "@/shared/domain/assets";
import type { CreateAssetRequest } from "./request";
import type { CreateAssetResponse } from "./response";

export type CreateAssetCommand = CreateAssetRequest & { userId: string };

export type CreateAssetRepository = {
  insert: (command: CreateAssetCommand) => Promise<CreateAssetResponse>;
};

export class CreateAssetCommandHandler {
  constructor(private readonly repository: CreateAssetRepository) {}

  async execute(command: CreateAssetCommand): Promise<CreateAssetResponse> {
    const asset = Asset.create({
      cash_balance: command.cash_balance,
      investment_balance: command.investment_balance,
      return_rate: command.return_rate,
    });

    return this.repository.insert({ userId: command.userId, ...asset.toPrimitive() });
  }
}
