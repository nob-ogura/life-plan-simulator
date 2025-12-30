import type { PostgrestError } from "@supabase/supabase-js";

const STOP_AFTER_AGE_COLUMN = "'stop_after_age'";
const LIFE_EVENTS_TABLE = "'life_events'";

export const canRetryWithoutStopAfterAge = (
  error: PostgrestError | null,
  stopAfterAge: unknown,
): boolean => {
  if (!error) {
    return false;
  }
  if (error.code !== "PGRST204") {
    return false;
  }

  const message = `${error.message ?? ""} ${error.details ?? ""}`;
  if (!message.includes(STOP_AFTER_AGE_COLUMN) || !message.includes(LIFE_EVENTS_TABLE)) {
    return false;
  }

  return stopAfterAge === null || stopAfterAge === undefined;
};

export const omitStopAfterAge = <T extends Record<string, unknown>>(
  payload: T,
): Omit<T, "stop_after_age"> => {
  const { stop_after_age: _ignored, ...rest } = payload;
  return rest;
};
