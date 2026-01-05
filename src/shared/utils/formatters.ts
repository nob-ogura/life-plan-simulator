import { UI_TEXT } from "@/shared/constants/messages";

type EmptyCheck<T> = (value: T) => boolean;

export const formatValueOrFallback = <T>(
  value: T | null | undefined,
  formatter: (value: T) => string,
  fallback = UI_TEXT.NOT_REGISTERED,
  isEmpty?: EmptyCheck<T>,
) => {
  if (value == null) return fallback;
  if (isEmpty?.(value)) return fallback;
  return formatter(value);
};
