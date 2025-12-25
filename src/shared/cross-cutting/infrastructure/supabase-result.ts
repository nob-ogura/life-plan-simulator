import type { PostgrestError } from "@supabase/supabase-js";

export const throwIfSupabaseError = (error: PostgrestError | null): void => {
  if (error) {
    throw error;
  }
};

export const unwrapSupabaseData = <T>(data: T | null, error: PostgrestError | null): T => {
  throwIfSupabaseError(error);
  if (data === null) {
    throw new Error("Supabase returned null data.");
  }
  return data;
};
