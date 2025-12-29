import { getDashboardSimulationAction } from "@/features/dashboard/queries/get-dashboard-simulation/action";
import type { GetDashboardSimulationResponse } from "@/features/dashboard/queries/get-dashboard-simulation/response";
import { DashboardSimulationView } from "@/features/dashboard/ui/DashboardSimulationView";

const summaryCardDefinitions = [
  {
    title: "累計収支",
    description: "表示範囲内の収支合計",
  },
  {
    title: "平均月残高",
    description: "平均的な月末残高",
  },
  {
    title: "資産寿命",
    description: "資産が枯渇する月",
  },
];

export default async function Home() {
  const response = await getDashboardSimulationAction({});
  const dashboardSimulation = response.ok
    ? ((await response.json()) as GetDashboardSimulationResponse)
    : null;
  const simulationResult = dashboardSimulation?.result ?? null;
  const simulationMonths = simulationResult?.months ?? [];
  const hasSimulation = simulationMonths.length > 0;
  const summaryCards = summaryCardDefinitions.map((card) => ({
    ...card,
    value: hasSimulation ? "計算済み" : "--",
  }));
  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">ライフプランの見える化</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          シミュレーション結果の要約と推移をまとめて確認できるダッシュボードです。
        </p>
      </section>

      <section className="sticky top-0 z-10 -mx-6 border-b border-border bg-background/80 px-6 pb-4 pt-2 backdrop-blur">
        <div className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Summary
              </p>
              <h2 className="mt-1 text-lg font-semibold">サマリカード</h2>
            </div>
            <span className="text-xs text-muted-foreground">スクロール時も固定表示</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-background/60 p-4"
              >
                <p className="text-xs font-semibold text-muted-foreground">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <DashboardSimulationView months={simulationMonths} />
    </div>
  );
}
