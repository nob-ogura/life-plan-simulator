export const toUserOwnedInsert = <T extends { userId: string }>(
  command: T,
): Omit<T, "userId"> & { user_id: string } => {
  const { userId, ...payload } = command;
  return { ...payload, user_id: userId };
};

type UserScopedQuery<TQuery> = {
  eq: (column: string, value: string) => TQuery;
};

export const scopeByUserId = <TQuery extends UserScopedQuery<TQuery>>(
  query: TQuery,
  userId: string,
): TQuery => query.eq("user_id", userId);

export const scopeByUserAndId = <TQuery extends UserScopedQuery<TQuery>>(
  query: TQuery,
  userId: string,
  id: string,
): TQuery => query.eq("id", id).eq("user_id", userId);
