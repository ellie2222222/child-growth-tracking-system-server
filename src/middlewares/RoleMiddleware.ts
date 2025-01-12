import mongoose from "mongoose"
import Database from "../utils/database"
import UserEnum from "../enums/UserEnum"
import StatusCodeEnum from "../enums/StatusCodeEnum"
import { Request, Response, NextFunction } from "express";
import UserRepository from "../repositories/UserRepository";

/**
* 
* @param role - The required role
* @returns An async function
*/
const roleMiddleware = (role: Number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {  
      const { userId } = req.user;
      const userRepository = new UserRepository();

      const user = await userRepository.getUserById(userId);
      if (!user) {
        res.status(StatusCodeEnum.NotFound_404).json({ message: "User not found" });
      }

      if (user?.role !== role) {
        res.status(StatusCodeEnum.Forbidden_403).json({ message: "Unauthorized access" });
      }

      next();
    } catch (error) {
       res.status(StatusCodeEnum.InternalServerError_500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = roleMiddleware;
