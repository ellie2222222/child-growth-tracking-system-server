import StatusCodeEnum from "../enums/StatusCodeEnum";
import { Request, Response, NextFunction } from "express";
import UserRepository from "../repositories/UserRepository";
import { IUser } from "../interfaces/IUser";

/**
 *
 * @param roles - The required roles
 * @returns An async function
 */
const RoleMiddleware = (roles: Array<number>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { userId } = req.user;
      const userRepository = new UserRepository();

      const user: IUser | null = await userRepository.getUserById(userId);
      if (!user) {
        res
          .status(StatusCodeEnum.NotFound_404)
          .json({ message: "User not found" });
        return;
      }

      if (!roles.includes(user?.role!)) {
        //adjust logic
        res
          .status(StatusCodeEnum.Forbidden_403)
          .json({ message: "Unauthorized access" });
        return;
      }

      next();
    } catch (error) {
      res
        .status(StatusCodeEnum.InternalServerError_500)
        .json({ message: "Internal Server Error" });
      return;
      //stop going forward and send other response => crash
    }
  };
};

export default RoleMiddleware;
