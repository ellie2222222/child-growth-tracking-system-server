import cron from "node-cron";
import UserRepository from "../repositories/UserRepository";
import getLogger from "./logger";
import RequestRepository from "../repositories/RequestRepository";
import { Types } from "mongoose";
import ConsultationRepository from "../repositories/ConsultationRepository";

const userRepository = new UserRepository();
const requestRepository = new RequestRepository();
const consultationRepository = new ConsultationRepository();

// Schedule the task to run every minute for debugging (change it later)
const task = cron.schedule(
  "* * * * *",
  async () => {
    // logger.info("Cron job started...");
    let logger = getLogger("MEMBERSHIP");
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

    logger = getLogger("EXPIRED_REQUEST");
    try {
      const requestIds = await requestRepository.getOldRequest();
      if (requestIds.length > 0) {
        await requestRepository.handleOldRequest(
          requestIds as Types.ObjectId[]
        );
        logger.info(`Processed ${requestIds.length} old requests.`);
      }
    } catch (error) {
      logger.error(`Error in cron job: ${(error as Error).message}`);
    }

    logger = getLogger("INACTIVE_CONSULTATION");
    try {
      const consultationIds = await consultationRepository.getOldConsultation();
      if (consultationIds.length > 0) {
        await consultationRepository.handleOldConsultations(
          consultationIds as Types.ObjectId[]
        );
        logger.info(`Processed ${consultationIds.length} old consultations.`);
      }
    } catch (error) {
      logger.error(`Error in cron job: ${(error as Error).message}`);
    }
  },
  { scheduled: true, timezone: "Asia/Ho_Chi_Minh" }
);

// logger.info("Cron job initialized."); // Log when cron is initialized

export default task;
