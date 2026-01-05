import { getDashboardSimulationAction } from "@/features/dashboard/queries/get-dashboard-simulation/action";
import type { GetDashboardSimulationResponse } from "@/features/dashboard/queries/get-dashboard-simulation/response";
import { DashboardSimulationView } from "@/features/dashboard/ui/DashboardSimulationView";

export default async function Home() {
  const response = await getDashboardSimulationAction({});
  const dashboardSimulation = response.ok
    ? ((await response.json()) as GetDashboardSimulationResponse)
    : null;
  const simulationResult = dashboardSimulation?.result ?? null;
  const simulationMonths = simulationResult?.months ?? [];
  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">生活設計ダッシュボード</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          シミュレーション結果の要約と推移をまとめて確認します
        </p>
      </section>

      <DashboardSimulationView months={simulationMonths} />
    </div>
  );
}
