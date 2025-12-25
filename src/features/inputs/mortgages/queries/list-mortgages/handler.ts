import type { ListMortgagesResponse } from "./response";

export type ListMortgagesQuery = { userId: string };

export type ListMortgagesRepository = {
  fetch: (query: ListMortgagesQuery) => Promise<ListMortgagesResponse>;
};

export class ListMortgagesQueryHandler {
  constructor(private readonly repository: ListMortgagesRepository) {}

  async execute(query: ListMortgagesQuery): Promise<ListMortgagesResponse> {
    return this.repository.fetch(query);
  }
}
