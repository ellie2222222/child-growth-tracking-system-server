import nodemailer, { TransportOptions } from "nodemailer";
import getLogger from "./logger";
import Mail from "nodemailer/lib/mailer";
const logger = getLogger("MAIL");

import dotenv from "dotenv";
dotenv.config();

const sendMail = async (mailOptions: Mail.Options): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const options: Mail.Options = {
      from: process.env.EMAIL_USER,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    };

    const info = await transporter.sendMail(options);
    logger.info(`Email sent: ${info.response}`);

    transporter.verify(function (error, success) {
      if (error) {
        logger.error(error);
      } else {
        logger.info("Server is ready to take our messages");
      }
    });
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
  }
};

export default sendMail;
