const GrowthMetricsEnum = {
  BFA: "Body Mass Index for Age",
  WFA: "Weight for Age",
  LHFA: "Length/Height for Age",
  WFLH: "Weight for Length/Height",
  HCFA: "Head Circumference for Age",
  ACFA: "Arm Circumference for Age",
  WV: "Weight Velocity",
  HV: "Height Velocity",
  HCV: "Head Circumference Velocity",
};
  
export default GrowthMetricsEnum;

export type GrowthMetricsEnumType = typeof GrowthMetricsEnum[keyof typeof GrowthMetricsEnum];