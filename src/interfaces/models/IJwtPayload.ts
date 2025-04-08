import { JwtPayload } from "jsonwebtoken";
export default interface IJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: number;
  timestamp: Date;
}
export interface IVerificationTokenPayload extends JwtPayload {
  password: string;
  email: string;
  name: string;
}