import type { ListExpensesResponse } from "./response";

export type ListExpensesQuery = { userId: string };

export type ListExpensesRepository = {
  fetch: (query: ListExpensesQuery) => Promise<ListExpensesResponse>;
};

export class ListExpensesQueryHandler {
  constructor(private readonly repository: ListExpensesRepository) {}

  async execute(query: ListExpensesQuery): Promise<ListExpensesResponse> {
    return this.repository.fetch(query);
  }
}
