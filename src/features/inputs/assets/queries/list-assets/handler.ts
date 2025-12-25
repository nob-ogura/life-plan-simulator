import type { ListAssetsResponse } from "./response";

export type ListAssetsQuery = { userId: string };

export type ListAssetsRepository = {
  fetch: (query: ListAssetsQuery) => Promise<ListAssetsResponse>;
};

export class ListAssetsQueryHandler {
  constructor(private readonly repository: ListAssetsRepository) {}

  async execute(query: ListAssetsQuery): Promise<ListAssetsResponse> {
    return this.repository.fetch(query);
  }
}
