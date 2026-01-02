import { buildSimulationSectionDefaults } from "@/features/inputs/simulation/ui/mapper";
import { SimulationForm } from "@/features/inputs/simulation/ui/SimulationForm";
import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";
import type { Tables } from "@/types/supabase";

type SettingsData = {
  simulationSettings: Tables<"simulation_settings"> | null;
};

const emptyData: SettingsData = {
  simulationSettings: null,
};

const loadSettingsData = async (): Promise<SettingsData> => {
  const client = createServerSupabaseClient();
  const auth = createServerAuthSession(client);

  let userId: string;
  try {
    userId = await auth.requireUserId();
  } catch {
    return emptyData;
  }

  const safeFetch = async <T,>(fetcher: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fetcher();
    } catch {
      return fallback;
    }
  };

  const simulationSettings = await safeFetch(async () => {
    const { data, error } = await client
      .from("simulation_settings")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, null);

  return { simulationSettings };
};

export default async function SettingsPage() {
  const data = await loadSettingsData();
  const simulationSectionDefaults = buildSimulationSectionDefaults(data.simulationSettings);
  const simulationSettingsId = data.simulationSettings?.id ?? null;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">シミュレーション設定</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          シミュレーション期間や住宅係数など、計算の前提条件を管理します。
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/70 px-6 py-5">
          <h2 className="text-base font-semibold">共通設定</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            設定変更はシミュレーション結果に反映されます。
          </p>
        </div>
        <div className="px-6 py-5">
          <SimulationForm
            defaultValues={simulationSectionDefaults}
            settingsId={simulationSettingsId}
          />
        </div>
      </section>
    </div>
  );
}
