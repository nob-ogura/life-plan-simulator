import { describe, expect, it } from "vitest";
import {
  describeLifeEventRepeat,
  normalizeLifeEventRepeat,
} from "@/shared/domain/life-events/repeat";

describe("life event repeat", () => {
  it("returns none when interval is missing", () => {
    expect(
      describeLifeEventRepeat({
        repeat_interval_years: null,
        stop_after_occurrences: 3,
        stop_after_age: 65,
      }),
    ).toBe("なし");
  });

  it("describes repeat with stop occurrences", () => {
    expect(
      describeLifeEventRepeat({
        repeat_interval_years: 2,
        stop_after_occurrences: 3,
        stop_after_age: null,
      }),
    ).toBe("2年ごと（停止: 3回）");
  });

  it("describes repeat with stop age", () => {
    expect(
      describeLifeEventRepeat({
        repeat_interval_years: 2,
        stop_after_occurrences: null,
        stop_after_age: 65,
      }),
    ).toBe("2年ごと（停止: 65歳）");
  });

  it("describes repeat with both stop conditions", () => {
    expect(
      describeLifeEventRepeat({
        repeat_interval_years: 2,
        stop_after_occurrences: 3,
        stop_after_age: 65,
      }),
    ).toBe("2年ごと（停止: 3回 / 65歳）");
  });

  it("normalizes invalid values as null except stop occurrences", () => {
    expect(
      normalizeLifeEventRepeat({
        repeat_interval_years: 0,
        stop_after_occurrences: 0,
        stop_after_age: -1,
      }),
    ).toEqual({
      intervalYears: null,
      stopAfterOccurrences: 0,
      stopAfterAge: null,
    });
  });
});
