import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserService from "../services/UserService";
import { Request, Response, NextFunction } from "express";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Handle update role
   */
  updateRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterRole = req.userInfo.role;
      const { userId } = req.params;
      const { role } = req.body;

      await this.userService.updateRole(userId, role, requesterRole);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.userInfo.userId;
      const { name, email, phoneNumber, password, type } = req.body;

      const user = await this.userService.createUser(
        name,
        password,
        email,
        phoneNumber,
        type,
        requesterId
      );

      res.status(StatusCodeEnum.Created_201).json({
        user: user,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUserIndivitually = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.getIndividualUser(id, requesterId);

      res.status(StatusCodeEnum.OK_200).json({
        user: user,
        message: "Get user successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, size, search, order, sortBy } = req.query;
      const requesterId = req.userInfo.userId;

      const data = await this.userService.getGroupUsers(
        {
          page: parseInt(page as string) || 1,
          size: parseInt(size as string) || 10,
          search: search as string,
          order: (order as "ascending" | "descending") || "ascending",
          sortBy: (sortBy as "date") || "date",
        },
        requesterId
      );

      res.status(StatusCodeEnum.OK_200).json(data);
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
