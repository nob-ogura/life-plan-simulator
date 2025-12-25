import type {
  ActionError,
  ActionSchema,
} from "@/shared/cross-cutting/infrastructure/action-adapter";
import { createAction } from "@/shared/cross-cutting/infrastructure/action-adapter";

type Endpoint<TReq, TRes> = {
  handle: (req: TReq) => Promise<TRes>;
};

type CreateActionResponseOptions = {
  mapError?: (error: unknown) => ActionError;
  successStatus?: 200 | 204;
};

const errorStatusMap: Record<string, number> = {
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  domain: 422,
  internal: 500,
};

const resolveErrorStatus = (error: ActionError): number => errorStatusMap[error.type] ?? 500;

export const createActionResponse = <TReq, TRes>(
  schema: ActionSchema<TReq>,
  endpointFactory: () => Endpoint<TReq, TRes> | Promise<Endpoint<TReq, TRes>>,
  options: CreateActionResponseOptions = {},
) => {
  const action = createAction(schema, endpointFactory, { mapError: options.mapError });

  return async (rawInput: unknown): Promise<Response> => {
    const result = await action(rawInput);
    if (!result.ok) {
      return Response.json(result.error, { status: resolveErrorStatus(result.error) });
    }

    const successStatus = options.successStatus ?? 200;
    if (successStatus === 204) {
      return new Response(null, { status: 204 });
    }

    return Response.json(result.data, { status: successStatus });
  };
};
