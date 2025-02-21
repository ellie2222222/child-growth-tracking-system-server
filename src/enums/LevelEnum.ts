export const LevelEnum = ["Low", "Below Average", "Average", "Above Average", "High", "N/A"];

export const BmiLevelEnum = ["Underweight", "Healthy Weight", "Overweight", "Obese", "N/A"];

export type LevelEnumType = typeof LevelEnum[keyof typeof LevelEnum];

export type BmiLevelEnumType = typeof BmiLevelEnum[keyof typeof BmiLevelEnum];