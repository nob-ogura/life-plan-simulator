import type { CreateSimulationSettingsRequest } from "./request";
import type { CreateSimulationSettingsResponse } from "./response";

export type CreateSimulationSettingsCommand = CreateSimulationSettingsRequest & { userId: string };

export type CreateSimulationSettingsRepository = {
  insert: (command: CreateSimulationSettingsCommand) => Promise<CreateSimulationSettingsResponse>;
};

export class CreateSimulationSettingsCommandHandler {
  constructor(private readonly repository: CreateSimulationSettingsRepository) {}

  async execute(
    command: CreateSimulationSettingsCommand,
  ): Promise<CreateSimulationSettingsResponse> {
    return this.repository.insert(command);
  }
}
