const { default: mongoose } = require("mongoose");
const DatabaseTransaction = require("../repositories/DatabaseTransaction");
const UserEnum = require("../enums/UserEnum");
const StatusCodeEnums = require("../enums/StatusCodeEnum");

const requireRole = (requiredRole) => {
  return async (req, res, next) => {
    const userId = req.userId;

    try {
      const connection = new DatabaseTransaction();

      const user = await connection.userRepository.findUserById(userId);
      if (!user) {
        return res.status(StatusCodeEnums.NotFound_404).json({ message: "User not found" });
      }

      if (user.role !== requiredRole) {
        return res.status(StatusCodeEnums.Forbidden_403).json({ message: "You do not have permission to perform this action" });
      }

      next();
    } catch (error) {
      return res.status(StatusCodeEnums.InternalServerError_500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = requireRole;
