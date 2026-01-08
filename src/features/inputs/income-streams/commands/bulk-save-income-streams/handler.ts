import type { BulkSaveIncomeStreamsRequest } from "./request";
import type { BulkSaveIncomeStreamsResponse } from "./response";
import type {
  IncomeStreamInsertPayload,
  IncomeStreamUpdateItem,
} from "./services/diff-income-streams";
import { diffIncomeStreams } from "./services/diff-income-streams";

export type BulkSaveIncomeStreamsCommand = BulkSaveIncomeStreamsRequest & { userId: string };

export type BulkSaveIncomeStreamsRepository = {
  deleteByIds: (command: { userId: string; ids: string[] }) => Promise<void>;
  insertMany: (command: { userId: string; payloads: IncomeStreamInsertPayload[] }) => Promise<void>;
  updateMany: (command: { userId: string; updates: IncomeStreamUpdateItem[] }) => Promise<void>;
};

export class BulkSaveIncomeStreamsCommandHandler {
  constructor(private readonly repository: BulkSaveIncomeStreamsRepository) {}

  async execute(command: BulkSaveIncomeStreamsCommand): Promise<BulkSaveIncomeStreamsResponse> {
    const { userId, initial_ids, streams } = command;
    const diff = diffIncomeStreams({ initialIds: initial_ids, streams });

    await this.repository.deleteByIds({ userId, ids: diff.removedIds });
    await this.repository.insertMany({ userId, payloads: diff.createPayloadsForInsert });
    await this.repository.updateMany({ userId, updates: diff.updatePayloadsForUpdate });
  }
}
