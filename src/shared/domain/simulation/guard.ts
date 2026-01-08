import type { SimulationProfile, SimulationSettings } from "./types";

export type SimulationReadinessInput = {
  profile: SimulationProfile | null;
  settings: SimulationSettings | null;
};

export const isSimulationReady = (
  input: SimulationReadinessInput,
): input is { profile: SimulationProfile; settings: SimulationSettings } => {
  const { profile, settings } = input;
  if (!profile || !settings) {
    return false;
  }
  return profile.birth_year != null && profile.birth_month != null;
};
