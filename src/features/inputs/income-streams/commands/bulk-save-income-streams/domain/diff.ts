import { toMonthStartDate, toOptionalMonthStartDate } from "@/features/inputs/shared/date";

import type { BulkSaveIncomeStreamsRequest } from "../request";

type NormalizedIncomeStream = BulkSaveIncomeStreamsRequest["streams"][number];

export type IncomeStreamInsertPayload = {
  label: string;
  take_home_monthly: number;
  bonus_months: number[];
  bonus_amount: number;
  change_year_month: string | null;
  bonus_amount_after: number | null;
  raise_rate?: number;
  start_year_month: string;
  end_year_month: string | null;
};

export type IncomeStreamUpdatePayload = {
  label: string;
  take_home_monthly: number;
  raise_rate?: number;
  start_year_month: string;
  end_year_month: string | null;
};

export type IncomeStreamUpdateItem = {
  id: string;
  payload: IncomeStreamUpdatePayload;
};

export type IncomeStreamDiff = {
  removedIds: string[];
  createPayloadsForInsert: IncomeStreamInsertPayload[];
  updatePayloadsForUpdate: IncomeStreamUpdateItem[];
};

const toCreatePayload = (stream: NormalizedIncomeStream): IncomeStreamInsertPayload => ({
  label: stream.label,
  take_home_monthly: stream.take_home_monthly,
  bonus_months: [],
  bonus_amount: 0,
  change_year_month: null,
  bonus_amount_after: null,
  raise_rate: stream.raise_rate,
  start_year_month: toMonthStartDate(stream.start_year_month),
  end_year_month: toOptionalMonthStartDate(stream.end_year_month),
});

const toUpdatePayload = (stream: NormalizedIncomeStream): IncomeStreamUpdatePayload => ({
  label: stream.label,
  take_home_monthly: stream.take_home_monthly,
  raise_rate: stream.raise_rate,
  start_year_month: toMonthStartDate(stream.start_year_month),
  end_year_month: toOptionalMonthStartDate(stream.end_year_month),
});

export const diffIncomeStreams = (params: {
  initialIds: string[];
  streams: NormalizedIncomeStream[];
}): IncomeStreamDiff => {
  const { initialIds, streams } = params;
  const currentIds = new Set(streams.map((stream) => stream.id).filter(Boolean) as string[]);
  const removedIds = initialIds.filter((id) => !currentIds.has(id));
  const createPayloadsForInsert = streams.flatMap((stream) =>
    stream.id ? [] : [toCreatePayload(stream)],
  );
  const updatePayloadsForUpdate = streams.flatMap((stream) =>
    stream.id ? [{ id: stream.id, payload: toUpdatePayload(stream) }] : [],
  );

  return {
    removedIds,
    createPayloadsForInsert,
    updatePayloadsForUpdate,
  };
};
