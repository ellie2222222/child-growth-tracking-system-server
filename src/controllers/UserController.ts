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
  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requesterRole = req.user.role;
      const { userId } = req.params;
      const { role } = req.body;

      await this.userService.updateRole(userId, role, requesterRole);

    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
