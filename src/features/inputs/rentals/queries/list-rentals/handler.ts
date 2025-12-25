import type { ListRentalsResponse } from "./response";

export type ListRentalsQuery = { userId: string };

export type ListRentalsRepository = {
  fetch: (query: ListRentalsQuery) => Promise<ListRentalsResponse>;
};

export class ListRentalsQueryHandler {
  constructor(private readonly repository: ListRentalsRepository) {}

  async execute(query: ListRentalsQuery): Promise<ListRentalsResponse> {
    return this.repository.fetch(query);
  }
}
