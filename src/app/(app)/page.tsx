import { Button } from "@/components/ui/button";
import { getDashboardSimulationAction } from "@/features/dashboard/queries/get-dashboard-simulation/action";
import type { GetDashboardSimulationResponse } from "@/features/dashboard/queries/get-dashboard-simulation/response";

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

const cashflowColumns = ["年月", "収入", "支出", "差分", "残高"];

const formatAmount = (value: number) =>
  `${new Intl.NumberFormat("ja-JP").format(Math.round(value))}円`;

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
  const previewMonths = hasSimulation ? simulationMonths.slice(0, 6) : [];

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

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Range
            </p>
            <h2 className="mt-1 text-lg font-semibold">表示範囲切替</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              直近5年と全期間を切り替えて表示します。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">直近5年</Button>
            <Button size="sm" variant="outline">
              全期間
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Assets Trend
            </p>
            <h2 className="mt-1 text-lg font-semibold">資産推移グラフ</h2>
          </div>
          <span className="text-xs text-muted-foreground">cash + investment</span>
        </div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-dashed border-border bg-background/60 p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                グラフ描画エリア{hasSimulation ? ` (${simulationMonths.length}ヶ月)` : ""}
              </span>
              <span>ハイライト: 枯渇月</span>
            </div>
            <div className="mt-4 h-56 rounded-lg bg-muted/40" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cashflow
            </p>
            <h2 className="mt-1 text-lg font-semibold">月次キャッシュフロー表</h2>
          </div>
          <span className="text-xs text-muted-foreground">仮想スクロール予定</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-5 gap-px bg-border text-xs font-semibold text-muted-foreground">
            {cashflowColumns.map((column) => (
              <div key={column} className="bg-background px-3 py-2">
                {column}
              </div>
            ))}
          </div>
          <div className="divide-y divide-border bg-background">
            {previewMonths.length > 0
              ? previewMonths.map((month) => {
                  const net = month.totalIncome - month.totalExpense + month.eventAmount;
                  return (
                    <div key={month.yearMonth} className="grid grid-cols-5 px-3 py-3 text-xs">
                      <div className="text-muted-foreground">{month.yearMonth}</div>
                      <div>{formatAmount(month.totalIncome)}</div>
                      <div>{formatAmount(month.totalExpense)}</div>
                      <div>{formatAmount(net)}</div>
                      <div>{formatAmount(month.totalBalance)}</div>
                    </div>
                  );
                })
              : Array.from({ length: 6 }, (_, index) => `placeholder-${index + 1}`).map((rowId) => (
                  <div key={rowId} className="grid grid-cols-5 px-3 py-3 text-xs">
                    <div className="text-muted-foreground">----</div>
                    <div className="text-muted-foreground">--</div>
                    <div className="text-muted-foreground">--</div>
                    <div className="text-muted-foreground">--</div>
                    <div className="text-muted-foreground">--</div>
                  </div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
