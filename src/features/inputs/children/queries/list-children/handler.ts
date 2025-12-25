import type { ListChildrenResponse } from "./response";

export type ListChildrenQuery = { userId: string };

export type ListChildrenRepository = {
  fetch: (query: ListChildrenQuery) => Promise<ListChildrenResponse>;
};

export class ListChildrenQueryHandler {
  constructor(private readonly repository: ListChildrenRepository) {}

  async execute(query: ListChildrenQuery): Promise<ListChildrenResponse> {
    return this.repository.fetch(query);
  }
}
