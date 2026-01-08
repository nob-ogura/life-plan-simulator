export type LifeEventRepeatInput = {
  repeat_interval_years?: number | null;
  stop_after_occurrences?: number | null;
  stop_after_age?: number | null;
};

export type NormalizedLifeEventRepeat = {
  intervalYears: number | null;
  stopAfterOccurrences: number | null;
  stopAfterAge: number | null;
};

const normalizeIntervalYears = (value?: number | null) =>
  value != null && value > 0 ? value : null;

const normalizeStopAfterOccurrences = (value?: number | null) =>
  value != null && value >= 0 ? value : null;

const normalizeStopAfterAge = (value?: number | null) =>
  value != null && value >= 0 ? value : null;

export const normalizeLifeEventRepeat = (
  input: LifeEventRepeatInput,
): NormalizedLifeEventRepeat => ({
  intervalYears: normalizeIntervalYears(input.repeat_interval_years),
  stopAfterOccurrences: normalizeStopAfterOccurrences(input.stop_after_occurrences),
  stopAfterAge: normalizeStopAfterAge(input.stop_after_age),
});

export const describeLifeEventRepeat = (input: LifeEventRepeatInput) => {
  const normalized = normalizeLifeEventRepeat(input);
  const interval = normalized.intervalYears;
  if (!interval) return "なし";
  const intervalLabel = `${interval}年ごと`;
  const stopLabels: string[] = [];
  if (normalized.stopAfterOccurrences != null) {
    stopLabels.push(`${normalized.stopAfterOccurrences}回`);
  }
  if (normalized.stopAfterAge != null) {
    stopLabels.push(`${normalized.stopAfterAge}歳`);
  }
  if (stopLabels.length === 0) return `${intervalLabel}（停止なし）`;
  return `${intervalLabel}（停止: ${stopLabels.join(" / ")}）`;
};
