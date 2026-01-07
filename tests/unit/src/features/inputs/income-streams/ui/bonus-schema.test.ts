import { describe, expect, it } from "vitest";

import { BonusSectionSchema } from "@/features/inputs/income-streams/ui/bonus-schema";

const findIssueMessage = (
  issues: Array<{ path: Array<PropertyKey>; message: string }>,
  path: string,
) => issues.find((issue) => issue.path.map(String).join(".") === path)?.message;

describe("bonus section schema", () => {
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
