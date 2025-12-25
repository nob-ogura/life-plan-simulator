import { describe, expect, it } from "vitest";
import type {
  ActionError,
  ActionResult,
  ActionSchema,
} from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";

type NumberSchema = ActionSchema<number>;

const numberSchema: NumberSchema = {
  safeParse: (input) =>
    typeof input === "number"
      ? { success: true, data: input }
      : {
          success: false,
          error: { issues: [{ path: [], message: "Expected number" }] },
        },
};

describe("createAction", () => {
  it("returns data when the handler succeeds", async () => {
    const action = createAction(numberSchema, () => ({
      handle: async (value) => value + 1,
    }));

    const result = await action(1);

    expect(result).toEqual({ ok: true, data: 2 });
  });

  it("returns validation issues when schema parsing fails", async () => {
    const action = createAction(numberSchema, () => ({
      handle: async (value) => value + 1,
    }));

    const result = await action("oops");

    expect(result).toEqual({
      ok: false,
      error: {
        type: "validation",
        message: "Invalid request",
        issues: [{ path: "(root)", message: "Expected number" }],
      },
    });
  });

  it("maps unexpected errors to internal errors", async () => {
    const action = createAction(numberSchema, () => ({
      handle: async () => {
        throw new Error("boom");
      },
    }));

    const result = (await action(1)) as ActionResult<number>;

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        type: "internal",
        message: "Internal Server Error",
      });
    }
  });

  it("returns ActionError thrown by the handler as-is", async () => {
    const actionError: ActionError = { type: "forbidden", message: "No access" };
    const action = createAction(numberSchema, () => ({
      handle: async () => {
        throw actionError;
      },
    }));

    const result = await action(1);

    expect(result).toEqual({ ok: false, error: actionError });
  });

  it("uses mapError when provided", async () => {
    const action = createAction(
      numberSchema,
      () => ({
        handle: async () => {
          throw new Error("nope");
        },
      }),
      {
        mapError: () => ({ type: "domain", message: "Handled elsewhere" }),
      },
    );

    const result = await action(1);

    expect(result).toEqual({
      ok: false,
      error: { type: "domain", message: "Handled elsewhere" },
    });
  });
});
