export const FeedingTypeEnum = {
  N_A: "N/A",
  BREASTFEEDING: "BREASTFEEDING",
  FORMULA_FEEDING: "FORMULA_FEEDING",
  SOLID_FOODS: "SOLID_FOODS",
}

export type FeedingTypeEnumType =
  (typeof FeedingTypeEnum)[keyof typeof FeedingTypeEnum];
