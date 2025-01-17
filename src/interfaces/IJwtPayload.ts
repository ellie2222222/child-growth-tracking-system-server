import { JwtPayload } from "jsonwebtoken";

export default interface IJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: number;
  timestamp: Date;
}
