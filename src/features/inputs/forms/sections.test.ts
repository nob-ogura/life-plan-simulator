import { describe, expect, it } from "vitest";

import { BonusSectionSchema, FamilySectionSchema, IncomeSectionSchema } from "./sections";

const findIssueMessage = (
  issues: Array<{ path: Array<PropertyKey>; message: string }>,
  path: string,
) => issues.find((issue) => issue.path.map(String).join(".") === path)?.message;

describe("inputs form schemas", () => {
  it("requires birth year/month with Japanese messages", () => {
    const result = FamilySectionSchema.safeParse({
      profile: {
        birth_year: "",
        birth_month: "",
        spouse_birth_year: "",
        spouse_birth_month: "",
      },
      children: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "profile.birth_year")).toBe("必須項目です");
      expect(findIssueMessage(result.error.issues, "profile.birth_month")).toBe("必須項目です");
      expect(findIssueMessage(result.error.issues, "profile.spouse_birth_year")).toBe(
        "必須項目です",
      );
      expect(findIssueMessage(result.error.issues, "profile.spouse_birth_month")).toBe(
        "必須項目です",
      );
    }
  });

  it("rejects non-numeric input with Japanese message", () => {
    const result = FamilySectionSchema.safeParse({
      profile: {
        birth_year: "abc",
        birth_month: "4",
        spouse_birth_year: "1990",
        spouse_birth_month: "6",
      },
      children: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "profile.birth_year")).toBe(
        "数値で入力してください",
      );
    }
  });

  it("requires at least one of birth/due year-month for children", () => {
    const result = FamilySectionSchema.safeParse({
      profile: {
        birth_year: "1980",
        birth_month: "5",
        spouse_birth_year: "1982",
        spouse_birth_month: "7",
      },
      children: [
        {
          id: "child-1",
          label: "子ども",
          birth_year_month: "",
          due_year_month: "",
          note: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "children.0.birth_year_month")).toBe(
        "出生年月か誕生予定年月のどちらかを入力してください",
      );
    }
  });

  it("validates year-month format with Japanese message", () => {
    const result = IncomeSectionSchema.safeParse({
      streams: [
        {
          id: "income-1",
          label: "給与",
          take_home_monthly: "300000",
          raise_rate: "",
          start_year_month: "2024-13",
          end_year_month: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "streams.0.start_year_month")).toBe(
        "YYYY-MM 形式で入力してください",
      );
    }
  });

  it("accepts optional year-month when empty", () => {
    const result = IncomeSectionSchema.safeParse({
      streams: [
        {
          id: "income-1",
          label: "給与",
          take_home_monthly: "300000",
          raise_rate: "",
          start_year_month: "2024-04",
          end_year_month: "",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("validates bonus change year-month format with Japanese message", () => {
    const result = BonusSectionSchema.safeParse({
      streams: [
        {
          id: "income-1",
          label: "給与",
          bonus_months: [6, 12],
          bonus_amount: "200000",
          change_year_month: "2024-13",
          bonus_amount_after: "",
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "streams.0.change_year_month")).toBe(
        "YYYY-MM 形式で入力してください",
      );
    }
  });
});
