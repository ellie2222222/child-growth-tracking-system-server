import StatusCodeEnum from "../enums/StatusCodeEnum";
import UserEnum from "../enums/UserEnum";
import CustomException from "../exceptions/CustomException";
import { IUser } from "../interfaces/IUser";
import UserRepository from "../repositories/UserRepository";
import Database from "../utils/database";

class UserService {
  private userRepository: UserRepository;
  private database: Database;

  constructor() {
    this.userRepository = new UserRepository();
    this.database = Database.getInstance();
  }

  /**
   * Verify the user's email using the token.
   * @param userId - The target user ID
   * @param role - Role to be updated
   * @param requesterRole - The requester role
   * @returns A void promise.
   */
  updateRole = async (
    userId: string,
    role: number,
    requesterRole: number
  ): Promise<void> => {
    const session = await this.database.startTransaction();
    try {
      const user = await this.userRepository.getUserById(userId);

      // Check if user exists
      if (!user) {
        throw new CustomException(
          StatusCodeEnum.NotFound_404,
          "User not found"
        );
      }

      // Check if the requester is trying to update their own role
      if (userId === user._id) {
        throw new CustomException(
          StatusCodeEnum.BadRequest_400,
          "Cannot update own role"
        );
      }

      // Check if the user is attempting to change to the same role
      if (user.role === role) {
        throw new CustomException(StatusCodeEnum.BadRequest_400, "Role is already the same");
      }

      // Check if a super admin is trying to change their own role or another super admin's role
      if (requesterRole === UserEnum.SUPER_ADMIN) {
        if (role === UserEnum.SUPER_ADMIN) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Only one super admin allowed"
          );
        }
      }

      // If the requester is an admin, they cannot change another admin's role
      if (requesterRole === UserEnum.ADMIN) {
        if (role === UserEnum.ADMIN || role === UserEnum.SUPER_ADMIN) {
          throw new CustomException(
            StatusCodeEnum.BadRequest_400,
            "Admins cannot change another admin's role"
          );
        }
      }

      // Update the user's role
      const updateData: Partial<IUser> = { role };
      await this.userRepository.updateUserById(userId, updateData, session);

      // Commit the transaction
      await this.database.commitTransaction();
    } catch (error: any) {
      // Rollback the transaction in case of any error
      await this.database.abortTransaction();
      throw error;
    }
  };
}

export default UserService;
