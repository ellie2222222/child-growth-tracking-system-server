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
      res.status(StatusCodeEnum.OK_200).json({
        message: "Update role successfully",
      });
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

  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.getUserById(id, requesterId);

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

      const data = await this.userService.getUsers(
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

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.updateUser(id, requesterId, { name });

      res
        .status(StatusCodeEnum.OK_200)
        .json({ user: user, message: "User updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.deleteUser(id, requesterId);

      res
        .status(StatusCodeEnum.OK_200)
        .json({ userIsDeleted: user, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  //removeCurrentSubscription
  removeCurrentSubscription = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const user = await this.userService.removeCurrentSubscription(
        id,
        requesterId
      );

      res
        .status(StatusCodeEnum.OK_200)
        .json({ user: user, message: "Removed membership successfully" });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
