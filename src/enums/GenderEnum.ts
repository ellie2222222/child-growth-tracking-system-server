const GenderEnum = {
  BOY: 1,
  GIRL: 0,
};

export default GenderEnum;

export type GenderEnumType = typeof GenderEnum[keyof typeof GenderEnum];