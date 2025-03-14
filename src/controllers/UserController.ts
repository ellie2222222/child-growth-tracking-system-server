import StatusCodeEnum from "../enums/StatusCodeEnum";
import { IUser } from "../interfaces/IUser";
import { IUserService } from "../interfaces/services/IUserService";
// import UserService from "../services/UserService";
import { Request, Response, NextFunction } from "express";
import { cleanUpFile } from "../utils/fileUtils";

class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  /**
   * Handle update role
   */
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.userInfo.userId;
      const { name, email, phoneNumber, password, role } = req.body;

      const user = await this.userService.createUser(
        name,
        password,
        email,
        phoneNumber,
        role,
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
      const { name, role, phoneNumber } = req.body;
      const requesterId = req.userInfo.userId;
      let user: IUser | null;
      if (req.file) {
        user = await this.userService.updateUser(
          id,
          requesterId,
          name,
          role,
          phoneNumber,
          `${process.env.SERVER_URL}/${req.file.path}`
        );
      } else {
        user = await this.userService.updateUser(
          id,
          requesterId,
          name,
          role,
          phoneNumber
        );
      }

      res
        .status(StatusCodeEnum.OK_200)
        .json({ user: user, message: "User updated successfully" });
    } catch (error) {
      if (req.file) {
        cleanUpFile(req.file.path, "create");
      }
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

  createConsultationRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const { rating } = req.body;

      const updatedConsultation =
        await this.userService.createConsultationRating(
          id,
          requesterId,
          rating
        );
      res.status(200).json({
        consultation: updatedConsultation,
        message: "Consultation rating has been created",
      });
    } catch (error) {
      next(error);
    }
  };

  updateConsultationRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;
      const { rating } = req.body;

      const updatedConsultation =
        await this.userService.updateConsultationRating(
          id,
          requesterId,
          rating
        );
      res.status(200).json({
        consultation: updatedConsultation,
        message: "Consultation rating has been created",
      });
    } catch (error) {
      next(error);
    }
  };

  removeConsultationRating = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const requesterId = req.userInfo.userId;

      const updatedConsultation =
        await this.userService.removeConsultationRating(id, requesterId, 0);
      res.status(200).json({
        consultation: updatedConsultation,
        message: "Consultation rating has been created",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
