import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { SupabaseListAssetsRepository } from "@/features/inputs/assets/queries/list-assets/repository";
import { AssetForm } from "@/features/inputs/assets/ui/AssetForm";
import { buildAssetFormDefaults } from "@/features/inputs/assets/ui/mapper";
import { SupabaseListChildrenRepository } from "@/features/inputs/children/queries/list-children/repository";
import { SupabaseListExpensesRepository } from "@/features/inputs/expenses/queries/list-expenses/repository";
import { ExpenseForm } from "@/features/inputs/expenses/ui/ExpenseForm";
import { buildExpenseSectionDefaults } from "@/features/inputs/expenses/ui/mapper";
import { FamilyForm } from "@/features/inputs/family/ui/FamilyForm";
import { buildFamilySectionDefaults } from "@/features/inputs/family/ui/mapper";
import { HousingForm } from "@/features/inputs/housing/ui/HousingForm";
import { buildHousingSectionDefaults } from "@/features/inputs/housing/ui/mapper";
import { SupabaseListIncomeStreamsRepository } from "@/features/inputs/income-streams/queries/list-income-streams/repository";
import { BonusForm } from "@/features/inputs/income-streams/ui/BonusForm";
import { IncomeForm } from "@/features/inputs/income-streams/ui/IncomeForm";
import {
  buildBonusSectionDefaults,
  buildIncomeSectionDefaults,
} from "@/features/inputs/income-streams/ui/mapper";
import { SupabaseListLifeEventsRepository } from "@/features/inputs/life-events/queries/list-life-events/repository";
import { LifeEventSection } from "@/features/inputs/life-events/ui/LifeEventSection";
import { SupabaseListMortgagesRepository } from "@/features/inputs/mortgages/queries/list-mortgages/repository";
import { buildPensionSectionDefaults } from "@/features/inputs/pension/ui/mapper";
import { PensionForm } from "@/features/inputs/pension/ui/PensionForm";
import { SupabaseListRentalsRepository } from "@/features/inputs/rentals/queries/list-rentals/repository";
import { buildRetirementSectionDefaults } from "@/features/inputs/retirement/ui/mapper";
import { RetirementBonusForm } from "@/features/inputs/retirement/ui/RetirementBonusForm";
import { UI_TEXT } from "@/shared/constants/messages";
import { createServerAuthSession } from "@/shared/cross-cutting/auth/server-auth";
import { createServerSupabaseClient } from "@/shared/cross-cutting/infrastructure/supabase.server";
import { Money } from "@/shared/domain/value-objects/Money";
import { YearMonth } from "@/shared/domain/value-objects/YearMonth";
import { formatValueOrFallback } from "@/shared/utils/formatters";
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

const formatYearMonth = (year?: number | null, month?: number | null) =>
  formatValueOrFallback(
    year == null || month == null ? null : { year, month },
    ({ year: safeYear, month: safeMonth }) =>
      YearMonth.formatJapaneseFromParts(safeYear, safeMonth),
  );

const formatCount = (count: number, unit: string = UI_TEXT.UNIT_COUNT) =>
  count > 0 ? `${count}${unit}` : UI_TEXT.NOT_REGISTERED;

const formatRegistered = (count: number) =>
  count > 0 ? UI_TEXT.REGISTERED : UI_TEXT.NOT_REGISTERED;

const formatAmount = (value?: number | null) =>
  formatValueOrFallback(value, (safeValue) => {
    return Money.of(safeValue).formatYen();
  });

const formatNumber = (value?: number | null, suffix = "") =>
  formatValueOrFallback(value, (safeValue) => `${safeValue}${suffix}`);

const statusLabel = (
  hasData: boolean,
  filled: string = UI_TEXT.REGISTERED,
  empty: string = UI_TEXT.NOT_REGISTERED,
) => (hasData ? filled : empty);

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
  const pensionAmountSingle = data.simulationSettings?.pension_amount_single ?? null;
  const pensionAmountSpouse = data.simulationSettings?.pension_amount_spouse ?? null;
  const pensionAmountTotal =
    pensionAmountSingle == null && pensionAmountSpouse == null
      ? null
      : (pensionAmountSingle ?? 0) + (pensionAmountSpouse ?? 0);

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
  const pensionSectionDefaults = buildPensionSectionDefaults(profile, data.simulationSettings);
  const assetSectionDefaults = buildAssetFormDefaults(data.assets);
  const assetId = data.assets[0]?.id ?? null;
  const simulationSettingsId = data.simulationSettings?.id ?? null;

  const sections: InputsSection[] = [
    {
      id: "family",
      title: "家族構成",
      description: "本人・配偶者・子どもの生年月や予定月をまとめて管理します",
      summary: `子ども ${formatCount(data.children.length, UI_TEXT.UNIT_PEOPLE)}`,
      status: statusLabel(hasFamilyData),
      rows: [
        { label: "本人", value: formatYearMonth(profile?.birth_year, profile?.birth_month) },
        {
          label: "配偶者",
          value: formatYearMonth(profile?.spouse_birth_year, profile?.spouse_birth_month),
        },
        { label: "子ども", value: formatCount(data.children.length, UI_TEXT.UNIT_PEOPLE) },
      ],
      note: "本人・配偶者の生年月は必須項目です 未入力の場合は登録できません",
      form: <FamilyForm defaultValues={familySectionDefaults} />,
    },
    {
      id: "income",
      title: "収入",
      description: "月次の収入、昇給率、期間を管理します",
      summary: `定期収入 ${formatCount(data.incomeStreams.length)}`,
      status: statusLabel(data.incomeStreams.length > 0),
      rows: [
        { label: "定期収入", value: formatCount(data.incomeStreams.length) },
        {
          label: "主な収入ラベル",
          value: data.incomeStreams[0]?.label ?? UI_TEXT.NOT_REGISTERED,
        },
      ],
      note: "手取り月額、昇給率、期間を登録します",
      form: <IncomeForm defaultValues={incomeSectionDefaults} />,
    },
    {
      id: "bonus",
      title: "ボーナス",
      description: "定期収入に紐づくボーナス設定を管理します",
      summary: `ボーナス設定 ${formatCount(bonusStreams.length)}`,
      status: statusLabel(bonusStreams.length > 0),
      rows: [
        { label: "ボーナス設定", value: formatCount(bonusStreams.length) },
        {
          label: "対象ストリーム",
          value: bonusStreams[0]?.label ?? UI_TEXT.NOT_REGISTERED,
        },
      ],
      note: "定期収入ごとのボーナス月・金額・変化点を登録します",
      form: <BonusForm defaultValues={bonusSectionDefaults} />,
    },
    {
      id: "expenses",
      title: "支出",
      description: "月次支出、インフレ率、期間を管理します",
      summary: `支出 ${formatCount(data.expenses.length)}`,
      status: statusLabel(data.expenses.length > 0),
      rows: [
        { label: "支出項目", value: formatCount(data.expenses.length) },
        { label: "主な支出ラベル", value: data.expenses[0]?.label ?? UI_TEXT.NOT_REGISTERED },
      ],
      note: "支出の月額・インフレ率・期間・カテゴリを登録します",
      form: <ExpenseForm defaultValues={expenseSectionDefaults} />,
    },
    {
      id: "housing",
      title: "住宅",
      description: "賃貸・住宅購入情報をまとめて管理します",
      summary: `賃貸 ${formatCount(data.rentals.length)} / 住宅購入 ${formatCount(
        data.mortgages.length,
      )}`,
      status: statusLabel(data.mortgages.length > 0 || data.rentals.length > 0),
      rows: [
        { label: "賃貸", value: formatCount(data.rentals.length) },
        { label: "住宅購入", value: formatCount(data.mortgages.length) },
      ],
      note: "賃貸・住宅購入の情報を登録します",
      form: <HousingForm defaultValues={housingSectionDefaults} />,
    },
    {
      id: "events",
      title: "ライフイベント",
      description: "教育費や介護費など、将来イベントを管理します",
      summary: `イベント ${formatCount(generalEvents.length)}`,
      status: statusLabel(generalEvents.length > 0),
      rows: [
        { label: "イベント数", value: formatCount(generalEvents.length) },
        { label: "主なイベント", value: generalEvents[0]?.label ?? UI_TEXT.NOT_REGISTERED },
      ],
      note: "繰り返し設定やカテゴリを含めてイベントを登録します",
      form: <LifeEventSection events={generalEvents} />,
    },
    {
      id: "retirement",
      title: "退職金",
      description: "退職金は単一レコードとして管理します",
      summary: `退職金 ${formatRegistered(retirementBonuses.length)}`,
      status: statusLabel(retirementBonuses.length > 0),
      rows: [
        { label: "退職金レコード", value: formatRegistered(retirementBonuses.length) },
        { label: "登録名", value: retirementBonuses[0]?.label ?? UI_TEXT.NOT_REGISTERED },
      ],
      note: `退職金${UI_TEXT.ONLY_ONE_RECORD_CAN_BE_REGISTERED}`,
      form: <RetirementBonusForm defaultValues={retirementSectionDefaults} />,
    },
    {
      id: "pension",
      title: "年金",
      description: "年金収入の開始年齢と月額を設定します",
      summary:
        pensionStartAge != null ||
        pensionAmountSingle != null ||
        pensionAmountSpouse != null ||
        pensionAmountTotal != null
          ? `開始年齢 ${formatNumber(pensionStartAge, "歳")} / 本人 ${formatAmount(
              pensionAmountSingle,
            )} / 配偶者 ${formatAmount(pensionAmountSpouse)} / 合計 ${formatAmount(
              pensionAmountTotal,
            )}`
          : UI_TEXT.NOT_REGISTERED,
      status: statusLabel(
        pensionStartAge != null ||
          pensionAmountSingle != null ||
          pensionAmountSpouse != null ||
          pensionAmountTotal != null,
        UI_TEXT.REGISTERED,
        UI_TEXT.NOT_REGISTERED,
      ),
      rows: [
        {
          label: "年金開始年齢",
          value: formatNumber(pensionStartAge, "歳"),
        },
        {
          label: "年金月額（本人）",
          value: formatAmount(pensionAmountSingle),
        },
        {
          label: "年金月額（配偶者）",
          value: formatAmount(pensionAmountSpouse),
        },
        {
          label: "年金月額（世帯合計）",
          value: formatAmount(pensionAmountTotal),
        },
      ],
      note: "年金開始年齢と月額は将来の年金収入の計算に反映されます",
      form: (
        <PensionForm
          defaultValues={pensionSectionDefaults}
          simulationSettingsId={simulationSettingsId}
        />
      ),
    },
    {
      id: "assets",
      title: "投資設定",
      description: "現金・運用残高と利回りを管理します",
      summary: `資産設定 ${formatRegistered(data.assets.length)}`,
      status: statusLabel(data.assets.length > 0),
      rows: [
        { label: "現金残高", value: formatAmount(data.assets[0]?.cash_balance) },
        { label: "運用残高", value: formatAmount(data.assets[0]?.investment_balance) },
        { label: "運用利回り", value: formatNumber(data.assets[0]?.return_rate) },
      ],
      note: `投資設定${UI_TEXT.ONLY_ONE_RECORD_CAN_BE_REGISTERED}`,
      form: <AssetForm defaultValues={assetSectionDefaults} assetId={assetId} />,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Inputs
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">基本情報の登録</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          収入・支出・家族構成など、生活設計に必要な情報をセクションごとに登録します
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
