import { describe, expect, it } from "vitest";

import { PensionSectionSchema } from "@/features/inputs/pension/ui/schema";

const findIssueMessage = (
  issues: Array<{ path: Array<PropertyKey>; message: string }>,
  path: string,
) => issues.find((issue) => issue.path.map(String).join(".") === path)?.message;

describe("pension section schema", () => {
  it("requires pension start age with Japanese message", () => {
    const result = PensionSectionSchema.safeParse({ pension_start_age: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "pension_start_age")).toBe("必須項目です");
    }
  });

  it("allows empty pension amounts", () => {
    const result = PensionSectionSchema.safeParse({
      pension_start_age: "65",
      pension_amount_single: "",
      pension_amount_spouse: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pension_amount_single).toBeUndefined();
      expect(result.data.pension_amount_spouse).toBeUndefined();
    }
  });

  it("rejects non-numeric pension amount with Japanese message", () => {
    const result = PensionSectionSchema.safeParse({
      pension_start_age: "65",
      pension_amount_single: "abc",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(findIssueMessage(result.error.issues, "pension_amount_single")).toBe(
        "数値で入力してください",
      );
    }
  });
});
