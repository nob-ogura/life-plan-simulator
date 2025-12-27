import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { SupabaseListAssetsRepository } from "@/features/inputs/assets/queries/list-assets/repository";
import { SupabaseListChildrenRepository } from "@/features/inputs/children/queries/list-children/repository";
import { SupabaseListExpensesRepository } from "@/features/inputs/expenses/queries/list-expenses/repository";
import { AssetSectionForm } from "@/features/inputs/forms/AssetSectionForm";
import { BonusSectionForm } from "@/features/inputs/forms/BonusSectionForm";
import { ExpenseSectionForm } from "@/features/inputs/forms/ExpenseSectionForm";
import { FamilySectionForm } from "@/features/inputs/forms/FamilySectionForm";
import { HousingSectionForm } from "@/features/inputs/forms/HousingSectionForm";
import { IncomeSectionForm } from "@/features/inputs/forms/IncomeSectionForm";
import { LifeEventSectionForm } from "@/features/inputs/forms/LifeEventSectionForm";
import { PensionSectionForm } from "@/features/inputs/forms/PensionSectionForm";
import { RetirementBonusSectionForm } from "@/features/inputs/forms/RetirementBonusSectionForm";
import { SimulationSectionForm } from "@/features/inputs/forms/SimulationSectionForm";
import {
  buildAssetSectionDefaults,
  buildBonusSectionDefaults,
  buildExpenseSectionDefaults,
  buildFamilySectionDefaults,
  buildHousingSectionDefaults,
  buildIncomeSectionDefaults,
  buildPensionSectionDefaults,
  buildRetirementSectionDefaults,
  buildSimulationSectionDefaults,
} from "@/features/inputs/forms/sections";
import { SupabaseListIncomeStreamsRepository } from "@/features/inputs/income-streams/queries/list-income-streams/repository";
import { SupabaseListLifeEventsRepository } from "@/features/inputs/life-events/queries/list-life-events/repository";
import { SupabaseListMortgagesRepository } from "@/features/inputs/mortgages/queries/list-mortgages/repository";
import { SupabaseListRentalsRepository } from "@/features/inputs/rentals/queries/list-rentals/repository";
import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";
import type { Tables } from "@/types/supabase";

type InputsData = {
  assets: Array<Tables<"assets">>;
  children: Array<Tables<"children">>;
  expenses: Array<Tables<"expenses">>;
  incomeStreams: Array<Tables<"income_streams">>;
  lifeEvents: Array<Tables<"life_events">>;
  mortgages: Array<Tables<"mortgages">>;
  rentals: Array<Tables<"rentals">>;
  profile: Tables<"profiles"> | null;
  simulationSettings: Tables<"simulation_settings"> | null;
};

const emptyData: InputsData = {
  assets: [],
  children: [],
  expenses: [],
  incomeStreams: [],
  lifeEvents: [],
  mortgages: [],
  rentals: [],
  profile: null,
  simulationSettings: null,
};

const formatYearMonth = (year?: number | null, month?: number | null) => {
  if (year == null || month == null) return "未入力";
  return `${year}年${String(month).padStart(2, "0")}月`;
};

const formatCount = (count: number, unit = "件") => (count > 0 ? `${count}${unit}` : "未登録");

const formatAmount = (value?: number | null) =>
  value == null ? "未入力" : `${new Intl.NumberFormat("ja-JP").format(value)}円`;

const formatNumber = (value?: number | null, suffix = "") =>
  value == null ? "未入力" : `${value}${suffix}`;

const statusLabel = (hasData: boolean, filled = "入力済み", empty = "未入力") =>
  hasData ? filled : empty;

const loadInputsData = async (): Promise<InputsData> => {
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

  const assetsRepository = new SupabaseListAssetsRepository(client);
  const childrenRepository = new SupabaseListChildrenRepository(client);
  const expensesRepository = new SupabaseListExpensesRepository(client);
  const incomeStreamsRepository = new SupabaseListIncomeStreamsRepository(client);
  const lifeEventsRepository = new SupabaseListLifeEventsRepository(client);
  const mortgagesRepository = new SupabaseListMortgagesRepository(client);
  const rentalsRepository = new SupabaseListRentalsRepository(client);

  const [
    assets,
    children,
    expenses,
    incomeStreams,
    lifeEvents,
    mortgages,
    rentals,
    profile,
    simulationSettings,
  ] = await Promise.all([
    safeFetch(() => assetsRepository.fetch({ userId }), [] as InputsData["assets"]),
    safeFetch(() => childrenRepository.fetch({ userId }), [] as InputsData["children"]),
    safeFetch(() => expensesRepository.fetch({ userId }), [] as InputsData["expenses"]),
    safeFetch(() => incomeStreamsRepository.fetch({ userId }), [] as InputsData["incomeStreams"]),
    safeFetch(() => lifeEventsRepository.fetch({ userId }), [] as InputsData["lifeEvents"]),
    safeFetch(() => mortgagesRepository.fetch({ userId }), [] as InputsData["mortgages"]),
    safeFetch(() => rentalsRepository.fetch({ userId }), [] as InputsData["rentals"]),
    safeFetch(async () => {
      const { data, error } = await client
        .from("profiles")
        .select()
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }, null),
    safeFetch(async () => {
      const { data, error } = await client
        .from("simulation_settings")
        .select()
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }, null),
  ]);

  return {
    assets,
    children,
    expenses,
    incomeStreams,
    lifeEvents,
    mortgages,
    rentals,
    profile,
    simulationSettings,
  };
};

type InputsSection = {
  id: string;
  title: string;
  description: string;
  summary: string;
  status: string;
  rows: Array<{ label: string; value: string }>;
  note: string;
  form?: ReactNode;
  defaultOpen?: boolean;
};

export default async function InputsPage() {
  const data = await loadInputsData();
  const retirementBonuses = data.lifeEvents.filter(
    (event) => event.category === "retirement_bonus",
  );
  const generalEvents = data.lifeEvents.filter((event) => event.category !== "retirement_bonus");
  const bonusStreams = data.incomeStreams.filter(
    (stream) => stream.bonus_amount > 0 || stream.bonus_months.length > 0,
  );

  const profile = data.profile;
  const pensionStartAge = profile?.pension_start_age ?? null;

  const hasFamilyData =
    data.children.length > 0 ||
    profile?.birth_year != null ||
    profile?.birth_month != null ||
    profile?.spouse_birth_year != null ||
    profile?.spouse_birth_month != null;

  const familySectionDefaults = buildFamilySectionDefaults(profile, data.children);
  const incomeSectionDefaults = buildIncomeSectionDefaults(data.incomeStreams);
  const bonusSectionDefaults = buildBonusSectionDefaults(data.incomeStreams);
  const expenseSectionDefaults = buildExpenseSectionDefaults(data.expenses);
  const housingSectionDefaults = buildHousingSectionDefaults(data.mortgages, data.rentals);
  const retirementSectionDefaults = buildRetirementSectionDefaults(retirementBonuses);
  const pensionSectionDefaults = buildPensionSectionDefaults(profile);
  const assetSectionDefaults = buildAssetSectionDefaults(data.assets);
  const simulationSectionDefaults = buildSimulationSectionDefaults(data.simulationSettings);
  const assetId = data.assets[0]?.id ?? null;
  const simulationSettingsId = data.simulationSettings?.id ?? null;

  const sections: InputsSection[] = [
    {
      id: "family",
      title: "家族構成",
      description: "本人・配偶者・子どもの生年月や予定月をまとめて管理します。",
      summary: `子ども ${formatCount(data.children.length, "人")}`,
      status: statusLabel(hasFamilyData),
      rows: [
        { label: "本人", value: formatYearMonth(profile?.birth_year, profile?.birth_month) },
        {
          label: "配偶者",
          value: formatYearMonth(profile?.spouse_birth_year, profile?.spouse_birth_month),
        },
        { label: "子ども", value: formatCount(data.children.length, "人") },
      ],
      note: "本人・配偶者の生年月は必須項目です。未入力の場合は保存できません。",
      form: <FamilySectionForm defaultValues={familySectionDefaults} />,
      defaultOpen: true,
    },
    {
      id: "income",
      title: "収入",
      description: "月次の収入、昇給率、期間を入力するセクションです。",
      summary: `収入ストリーム ${formatCount(data.incomeStreams.length)}`,
      status: statusLabel(data.incomeStreams.length > 0),
      rows: [
        { label: "収入ストリーム", value: formatCount(data.incomeStreams.length) },
        {
          label: "主な収入ラベル",
          value: data.incomeStreams[0]?.label ?? "未登録",
        },
      ],
      note: "手取り月額、昇給率、期間を入力して保存します。",
      form: <IncomeSectionForm defaultValues={incomeSectionDefaults} />,
    },
    {
      id: "bonus",
      title: "ボーナス",
      description: "収入ストリームに紐づくボーナス設定を管理します。",
      summary: `ボーナス設定 ${formatCount(bonusStreams.length)}`,
      status: statusLabel(bonusStreams.length > 0),
      rows: [
        { label: "ボーナス設定", value: formatCount(bonusStreams.length) },
        {
          label: "対象ストリーム",
          value: bonusStreams[0]?.label ?? "未登録",
        },
      ],
      note: "収入ストリームごとのボーナス月・金額・変化点を管理します。",
      form: <BonusSectionForm defaultValues={bonusSectionDefaults} />,
    },
    {
      id: "expenses",
      title: "支出",
      description: "月次支出、インフレ率、期間を登録するセクションです。",
      summary: `支出 ${formatCount(data.expenses.length)}`,
      status: statusLabel(data.expenses.length > 0),
      rows: [
        { label: "支出項目", value: formatCount(data.expenses.length) },
        { label: "主な支出ラベル", value: data.expenses[0]?.label ?? "未登録" },
      ],
      note: "支出の月額・インフレ率・期間・カテゴリを入力して保存します。",
      form: <ExpenseSectionForm defaultValues={expenseSectionDefaults} />,
    },
    {
      id: "housing",
      title: "住宅",
      description: "住宅購入・ローン・賃貸情報をまとめて管理します。",
      summary: `住宅購入 ${formatCount(data.mortgages.length)} / 賃貸 ${formatCount(
        data.rentals.length,
      )}`,
      status: statusLabel(data.mortgages.length > 0 || data.rentals.length > 0),
      rows: [
        { label: "住宅購入", value: formatCount(data.mortgages.length) },
        { label: "賃貸", value: formatCount(data.rentals.length) },
      ],
      note: "購入/賃貸の情報を入力して保存します。",
      form: <HousingSectionForm defaultValues={housingSectionDefaults} />,
    },
    {
      id: "events",
      title: "ライフイベント",
      description: "教育費や介護費など、将来イベントを登録するセクションです。",
      summary: `イベント ${formatCount(generalEvents.length)}`,
      status: statusLabel(generalEvents.length > 0),
      rows: [
        { label: "イベント数", value: formatCount(generalEvents.length) },
        { label: "主なイベント", value: generalEvents[0]?.label ?? "未登録" },
      ],
      note: "繰り返し設定やカテゴリを含めてイベントを登録します。",
      form: <LifeEventSectionForm events={generalEvents} />,
    },
    {
      id: "retirement",
      title: "退職金",
      description: "退職金は単一レコードとして管理し、イベントとは" + "排他にします。",
      summary: `退職金 ${formatCount(retirementBonuses.length)}`,
      status: statusLabel(retirementBonuses.length > 0),
      rows: [
        { label: "退職金レコード", value: formatCount(retirementBonuses.length) },
        { label: "登録名", value: retirementBonuses[0]?.label ?? "未登録" },
      ],
      note: "退職金は 1 件のみ保存され、再保存すると上書きされます。",
      form: <RetirementBonusSectionForm defaultValues={retirementSectionDefaults} />,
    },
    {
      id: "pension",
      title: "年金開始年齢",
      description: "年金収入の開始年齢を設定します。",
      summary: pensionStartAge != null ? `開始年齢 ${pensionStartAge}歳` : "未設定",
      status: statusLabel(pensionStartAge != null, "設定済み", "未設定"),
      rows: [
        {
          label: "年金開始年齢",
          value: pensionStartAge != null ? `${pensionStartAge}歳` : "未設定",
        },
      ],
      note: "年金開始年齢は将来の年金収入の計算に反映されます。",
      form: <PensionSectionForm defaultValues={pensionSectionDefaults} />,
    },
    {
      id: "assets",
      title: "投資設定",
      description: "現金・運用残高と利回りを管理します。",
      summary: data.assets.length > 0 ? "資産設定 登録済み" : "資産設定 未登録",
      status: statusLabel(data.assets.length > 0),
      rows: [
        { label: "現金残高", value: formatAmount(data.assets[0]?.cash_balance) },
        { label: "運用残高", value: formatAmount(data.assets[0]?.investment_balance) },
        { label: "運用利回り", value: formatNumber(data.assets[0]?.return_rate) },
      ],
      note: "投資設定は 1 件のみ保存され、保存すると上書きされます。",
      form: <AssetSectionForm defaultValues={assetSectionDefaults} assetId={assetId} />,
    },
    {
      id: "simulation",
      title: "シミュレーション設定",
      description: "係数や年齢上限などの共通設定を管理します。",
      summary: data.simulationSettings ? "係数設定 登録済み" : "係数設定 未登録",
      status: statusLabel(!!data.simulationSettings),
      rows: [
        {
          label: "終了年齢",
          value: formatNumber(data.simulationSettings?.end_age, "歳"),
        },
        {
          label: "年金月額（単身）",
          value: formatAmount(data.simulationSettings?.pension_amount_single),
        },
        {
          label: "年金月額（配偶者）",
          value: formatAmount(data.simulationSettings?.pension_amount_spouse),
        },
      ],
      note: "係数設定を変更するとシミュレーション結果に反映されます。",
      form: (
        <SimulationSectionForm
          defaultValues={simulationSectionDefaults}
          settingsId={simulationSettingsId}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Inputs
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">入力データの登録</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          収入・支出・家族構成など、ライフプランに必要なデータを 段階的に入力します。
          各セクションはアコーディオン形式で整理され、
          既存データがある場合はサマリーに反映されます。
        </p>
      </header>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <details
            key={section.id}
            className="group rounded-2xl border border-border bg-card shadow-sm"
            open={section.defaultOpen}
          >
            <summary
              className={`flex cursor-pointer list-none items-center justify-between gap-4
              px-6 py-5`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex size-9 items-center justify-center rounded-full border
                  border-border/70 bg-background text-sm font-semibold`}
                >
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <div className="text-base font-semibold">{section.title}</div>
                  <p className="text-sm text-muted-foreground">{section.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border border-border/70 bg-background px-2.5
                  py-1 text-xs font-medium text-muted-foreground`}
                >
                  {section.status}
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition group-open:rotate-180" />
              </div>
            </summary>
            <div className="border-t border-border/70 px-6 py-5">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{section.description}</p>
                {section.rows.length > 0 ? (
                  <dl className="grid gap-3 md:grid-cols-2">
                    {section.rows.map((row) => (
                      <div
                        key={`${section.id}-${row.label}`}
                        className="rounded-lg border border-border/70 bg-background/60 p-3"
                      >
                        <dt
                          className={`text-xs font-semibold uppercase tracking-wide
                          text-muted-foreground`}
                        >
                          {row.label}
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-foreground">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div
                  className={`rounded-lg border border-dashed border-border/70 bg-muted/40
                  p-3 text-xs text-muted-foreground`}
                >
                  {section.note}
                </div>
                {section.form ? (
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    {section.form}
                  </div>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
