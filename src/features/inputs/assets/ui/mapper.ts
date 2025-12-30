import type { CreateAssetRequest } from "@/features/inputs/assets/commands/create-asset/request";
import type { Tables } from "@/types/supabase";

import type { AssetFormInput, AssetFormPayload } from "./schema";

const toNumberInput = (value?: number | null) => (value == null ? "" : String(value));

export const buildAssetFormDefaults = (assets: Array<Tables<"assets">>): AssetFormInput => {
  const asset = assets[0];
  return {
    cash_balance: toNumberInput(asset?.cash_balance),
    investment_balance: toNumberInput(asset?.investment_balance),
    return_rate: toNumberInput(asset?.return_rate),
  };
};

export const toAssetPayload = (value: AssetFormPayload): CreateAssetRequest => ({
  cash_balance: value.cash_balance,
  investment_balance: value.investment_balance,
  return_rate: value.return_rate,
});
