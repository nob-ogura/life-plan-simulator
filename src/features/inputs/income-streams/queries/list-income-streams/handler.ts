import type { ListIncomeStreamsResponse } from "./response";

export type ListIncomeStreamsQuery = { userId: string };

export type ListIncomeStreamsRepository = {
  fetch: (query: ListIncomeStreamsQuery) => Promise<ListIncomeStreamsResponse>;
};

export class ListIncomeStreamsQueryHandler {
  constructor(private readonly repository: ListIncomeStreamsRepository) {}

  async execute(query: ListIncomeStreamsQuery): Promise<ListIncomeStreamsResponse> {
    return this.repository.fetch(query);
  }
}
