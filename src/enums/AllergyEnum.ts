export const AllergyEnum = {
  NONE: "NONE",
  N_A: "N/A",
  DRUG_ALLERGY: "DRUG_ALLERGY",
  FOOD_ALLERGY: "FOOD_ALLERGY",
  LATEX_ALLERGY: "LATEX_ALLERGY",
  MOLD_ALLERGY: "MOLD_ALLERGY",
  PET_ALLERGY: "PET_ALLERGY",
  POLLEN_ALLERGY: "POLLEN_ALLERGY",
}

export type AllergyEnumType = (typeof AllergyEnum)[keyof typeof AllergyEnum];
