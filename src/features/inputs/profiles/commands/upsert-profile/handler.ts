import type { UpsertProfileRequest } from "./request";
import type { UpsertProfileResponse } from "./response";

export type UpsertProfileCommand = UpsertProfileRequest & { userId: string };

export type UpsertProfileRepository = {
  upsert: (command: UpsertProfileCommand) => Promise<UpsertProfileResponse>;
};

export class UpsertProfileCommandHandler {
  constructor(private readonly repository: UpsertProfileRepository) {}

  async execute(command: UpsertProfileCommand): Promise<UpsertProfileResponse> {
    return this.repository.upsert(command);
  }
}
