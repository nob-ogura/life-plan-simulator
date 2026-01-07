import { describe, expect, it } from "vitest";

import { IncomeSectionSchema } from "@/features/inputs/income-streams/ui/schema";

const findIssueMessage = (
  issues: Array<{ path: Array<PropertyKey>; message: string }>,
  path: string,
) => issues.find((issue) => issue.path.map(String).join(".") === path)?.message;

describe("income section schema", () => {
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
});
