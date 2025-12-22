import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Base UI Ready
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Life Plan Simulator</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Tailwind CSS + shadcn/ui の基盤が整った状態です。今後は入力 UI
          とシミュレーション表示をここに積み上げていきます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button>Start with Inputs</Button>
          <Button variant="outline">Review Plan</Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Global Layout",
            body: "ヘッダーとレイアウトが共通化されています。",
          },
          {
            title: "Theme Tokens",
            body: "カラートークンとフォントが統一されています。",
          },
          {
            title: "Toast Ready",
            body: "トースト表示の基盤がセット済みです。",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-card p-5 text-sm shadow-sm"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
