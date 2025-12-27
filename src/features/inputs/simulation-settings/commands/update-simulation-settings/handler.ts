import type { UpdateSimulationSettingsRequest } from "./request";
import type { UpdateSimulationSettingsResponse } from "./response";

export type UpdateSimulationSettingsCommand = UpdateSimulationSettingsRequest & {
  userId: string;
};

export type UpdateSimulationSettingsRepository = {
  update: (command: UpdateSimulationSettingsCommand) => Promise<UpdateSimulationSettingsResponse>;
};

export class UpdateSimulationSettingsCommandHandler {
  constructor(private readonly repository: UpdateSimulationSettingsRepository) {}

  async execute(
    command: UpdateSimulationSettingsCommand,
  ): Promise<UpdateSimulationSettingsResponse> {
    return this.repository.update(command);
  }
}
