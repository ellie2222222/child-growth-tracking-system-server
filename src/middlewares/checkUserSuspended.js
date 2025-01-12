const StatusCodeEnums = require('../enums/StatusCodeEnum');
const DatabaseTransaction = require('../repositories/DatabaseTransaction');

const checkUserSuspended = async (req, res, next) => {
  try {
    const userId = req.userId; // Assuming you set the user ID in req.user after authentication

    const connection = new DatabaseTransaction();

    const user = await connection.userRepository.findUserById(userId);

    if (!user) {
      return res.status(StatusCodeEnums.NotFound_404).json({ message: "User not found" });
    }

    if (user.suspense?.isSuspended) {
      return res.status(StatusCodeEnums.Forbidden_403).json({ message: "This account is suspended." });
    }

    next();
  } catch (error) {
    console.error("Error checking user suspension:", error);
    return res.status(StatusCodeEnums.InternalServerError_500).json({ message: error.message });
  }
};

module.exports = checkUserSuspended;