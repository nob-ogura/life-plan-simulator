export const LIFE_EVENT_CATEGORIES = [
  { value: "education", label: "教育" },
  { value: "travel", label: "旅行" },
  { value: "care", label: "介護" },
  { value: "medical", label: "医療" },
  { value: "car", label: "車" },
  { value: "housing_purchase", label: "住宅購入" },
  { value: "other", label: "その他" },
  { value: "retirement_bonus", label: "退職金" },
] as const;

export type LifeEventCategory = (typeof LIFE_EVENT_CATEGORIES)[number]["value"];

export const GENERAL_LIFE_EVENT_CATEGORIES = LIFE_EVENT_CATEGORIES.filter(
  (category) => category.value !== "retirement_bonus",
);

export const LIFE_EVENT_CATEGORY_LABELS = new Map(
  LIFE_EVENT_CATEGORIES.map((category) => [category.value, category.label]),
);

export const isRetirementBonus = (category: LifeEventCategory) => category === "retirement_bonus";

export const isHousingPurchase = (category: LifeEventCategory) => category === "housing_purchase";
