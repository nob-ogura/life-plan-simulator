import type { UpsertRetirementBonusRequest } from "./request";
import type { UpsertRetirementBonusResponse } from "./response";

export type UpsertRetirementBonusCommand = UpsertRetirementBonusRequest & { userId: string };

export type UpsertRetirementBonusRepository = {
  upsert: (command: UpsertRetirementBonusCommand) => Promise<UpsertRetirementBonusResponse>;
};

export class UpsertRetirementBonusCommandHandler {
  constructor(private readonly repository: UpsertRetirementBonusRepository) {}

  async execute(command: UpsertRetirementBonusCommand): Promise<UpsertRetirementBonusResponse> {
    return this.repository.upsert(command);
  }
}
