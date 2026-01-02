import type { ResetSimulationSettingsResponse } from "./response";

export type ResetSimulationSettingsCommand = { userId: string };

export type ResetSimulationSettingsRepository = {
  reset: (command: ResetSimulationSettingsCommand) => Promise<ResetSimulationSettingsResponse>;
};

export class ResetSimulationSettingsCommandHandler {
  constructor(private readonly repository: ResetSimulationSettingsRepository) {}

  async execute(command: ResetSimulationSettingsCommand): Promise<ResetSimulationSettingsResponse> {
    return this.repository.reset(command);
  }
}
