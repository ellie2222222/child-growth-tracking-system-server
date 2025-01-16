export default interface IJwtPayload {
  userId: string;
  email: string;
  name: string;
  role: number;
  timestamp: Date;
}
