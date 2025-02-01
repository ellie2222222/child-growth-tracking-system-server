import { IBaseEntity } from "../models/BaseModel";

export interface IMembershipPackage extends IBaseEntity {
  name: string;
  description: string;
  price: {
    unit: "USD" | "VND";
    value: number;
  };
  duration: {
    unit: "DAY";
    value: number;
  };
  tier: number;
}
