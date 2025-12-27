import { DomainError, type DomainIssue } from "@/shared/domain/errors";

export type AssetPrimitive = {
  cash_balance: number;
  investment_balance: number;
  return_rate?: number;
};

const RETURN_RATE_MIN = -1;
const RETURN_RATE_MAX = 1;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const validateNonNegative = (value: unknown, path: string, issues: DomainIssue[]) => {
  if (!isFiniteNumber(value)) {
    issues.push({ path, message: "数値で入力してください" });
    return;
  }
  if (value < 0) {
    issues.push({ path, message: "0以上で入力してください" });
  }
};

const validateReturnRate = (value: unknown, issues: DomainIssue[]) => {
  if (!isFiniteNumber(value)) {
    issues.push({ path: "return_rate", message: "数値で入力してください" });
    return;
  }
  if (value < RETURN_RATE_MIN || value > RETURN_RATE_MAX) {
    issues.push({
      path: "return_rate",
      message: `${RETURN_RATE_MIN}〜${RETURN_RATE_MAX}の範囲で入力してください`,
    });
  }
};

const validateAsset = (input: AssetPrimitive): DomainIssue[] => {
  const issues: DomainIssue[] = [];
  validateNonNegative(input.cash_balance, "cash_balance", issues);
  validateNonNegative(input.investment_balance, "investment_balance", issues);
  if (input.return_rate !== undefined) {
    validateReturnRate(input.return_rate, issues);
  }
  return issues;
};

const validatePatch = (patch: Partial<AssetPrimitive>): DomainIssue[] => {
  const issues: DomainIssue[] = [];
  if (patch.cash_balance !== undefined) {
    validateNonNegative(patch.cash_balance, "cash_balance", issues);
  }
  if (patch.investment_balance !== undefined) {
    validateNonNegative(patch.investment_balance, "investment_balance", issues);
  }
  if (patch.return_rate !== undefined) {
    validateReturnRate(patch.return_rate, issues);
  }
  return issues;
};

export class Asset {
  private constructor(private readonly value: AssetPrimitive) {}

  static create(input: AssetPrimitive): Asset {
    const issues = validateAsset(input);
    if (issues.length > 0) {
      throw new DomainError("資産データが不正です", issues);
    }
    const normalized = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as AssetPrimitive;
    return new Asset(normalized);
  }

  static validatePatch(patch: Partial<AssetPrimitive>): Partial<AssetPrimitive> {
    const normalized = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ) as Partial<AssetPrimitive>;
    const issues = validatePatch(normalized);
    if (issues.length > 0) {
      throw new DomainError("資産データが不正です", issues);
    }
    return { ...normalized };
  }

  toPrimitive(): AssetPrimitive {
    return { ...this.value };
  }
}
