export type ActionIssue = {
  path: string;
  message: string;
};

export type ActionError = {
  type: string;
  message: string;
  issues?: ActionIssue[];
};

export type ActionResult<TRes> =
  | {
      ok: true;
      data: TRes;
    }
  | {
      ok: false;
      error: ActionError;
    };

export type ActionSchema<TReq> = {
  safeParse: (input: unknown) =>
    | { success: true; data: TReq }
    | {
        success: false;
        error: { issues: Array<{ path: Array<string | number>; message: string }> };
      };
};

type Handler<TReq, TRes> = (req: TReq) => Promise<TRes>;

type Endpoint<TReq, TRes> = {
  handle: Handler<TReq, TRes>;
};

type CreateActionOptions = {
  mapError?: (error: unknown) => ActionError;
};

const isActionError = (error: unknown): error is ActionError => {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const record = error as Record<string, unknown>;
  return typeof record.type === "string" && typeof record.message === "string";
};

const toIssues = (
  issues: Array<{ path: Array<string | number>; message: string }>,
): ActionIssue[] =>
  issues.map((issue) => ({
    path: issue.path.length === 0 ? "(root)" : issue.path.join("."),
    message: issue.message,
  }));

export const createAction = <TReq, TRes>(
  schema: ActionSchema<TReq>,
  endpointFactory: () => Endpoint<TReq, TRes> | Promise<Endpoint<TReq, TRes>>,
  options: CreateActionOptions = {},
) => {
  return async (rawInput: unknown): Promise<ActionResult<TRes>> => {
    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          type: "validation",
          message: "Invalid request",
          issues: toIssues(parsed.error.issues),
        },
      };
    }

    try {
      const endpoint = await endpointFactory();
      const data = await endpoint.handle(parsed.data);
      return { ok: true, data };
    } catch (error) {
      const resolved = isActionError(error)
        ? error
        : (options.mapError?.(error) ?? {
            type: "internal",
            message: "Internal Server Error",
          });

      if (resolved.type === "internal") {
        console.error(error);
      }

      return { ok: false, error: resolved };
    }
  };
};
