import cron from "node-cron";
import UserRepository from "../repositories/UserRepository";
import getLogger from "./logger";

const userRepository = new UserRepository();
const logger = getLogger("MEMBERSHIP");

// Schedule the task to run every minute for debugging (change it later)
const task = cron.schedule(
  "* * * * *",
  async () => {
    // logger.info("Cron job started...");

    try {
      const userIds = await userRepository.checkExpiration();

      if (userIds.length > 0) {
        await userRepository.handleExpirations(userIds);
        logger.info(`Processed ${userIds.length} expired memberships.`);
      } else {
        // logger.info("No memberships expired this cycle.");
      }
    } catch (error) {
      logger.error(`Error in cron job: ${(error as Error).message}`);
    }
  },
  { scheduled: true, timezone: "Asia/Ho_Chi_Minh" }
);

// logger.info("Cron job initialized."); // Log when cron is initialized

export default task;
