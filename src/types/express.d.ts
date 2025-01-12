// types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string,
        email: string,
        role: Number,
        ipAddress: string,
        userAgent: string,
        browser: {
          name?: string,
          version?: string,
        }
        os: {
          name?: string,
          version?: string,
        }
        device: {
          vendor?: string,
          model?: string,
          type?: string,
        }
        countryData: string,
        region: string,
        timezone: string,
        city: string,
        ll: Array,
      }
    }
  }
  
  type LooseObject = {
    [key: string]: any;
  };
}
