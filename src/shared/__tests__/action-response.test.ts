import { describe, expect, it } from "vitest";

import type { ActionSchema } from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createActionResponse } from "@/shared/cross-cutting/infrastructure/action-response";

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

describe("createActionResponse", () => {
  it("returns 400 when validation fails", async () => {
    const action = createActionResponse(numberSchema, () => ({
      handle: async (value) => value + 1,
    }));

    const response = await action("oops");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      type: "validation",
      message: "Invalid request",
      issues: [{ path: "(root)", message: "Expected number" }],
    });
  });

  it("returns 200 when handler succeeds", async () => {
    const action = createActionResponse(numberSchema, () => ({
      handle: async (value) => value + 1,
    }));

    const response = await action(1);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toBe(2);
  });

  it("returns 204 when configured", async () => {
    const action = createActionResponse(
      numberSchema,
      () => ({
        handle: async (value) => value + 1,
      }),
      { successStatus: 204 },
    );

    const response = await action(1);

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
  });

  it("maps unauthorized errors to 401", async () => {
    const action = createActionResponse(numberSchema, () => ({
      handle: async () => {
        throw { type: "unauthorized", message: "Unauthorized" };
      },
    }));

    const response = await action(1);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      type: "unauthorized",
      message: "Unauthorized",
    });
  });
});
