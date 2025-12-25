import type { ListLifeEventsResponse } from "./response";

export type ListLifeEventsQuery = { userId: string };

export type ListLifeEventsRepository = {
  fetch: (query: ListLifeEventsQuery) => Promise<ListLifeEventsResponse>;
};

export class ListLifeEventsQueryHandler {
  constructor(private readonly repository: ListLifeEventsRepository) {}

  async execute(query: ListLifeEventsQuery): Promise<ListLifeEventsResponse> {
    return this.repository.fetch(query);
  }
}
