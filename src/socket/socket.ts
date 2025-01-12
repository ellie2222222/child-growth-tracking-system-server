import { Server } from "socket.io";
import getLogger from "../utils/logger";
import jwt from "jsonwebtoken";
import "dotenv/config";

const logger = getLogger("SOCKET");

export default (server: any): void => {
  const io = new Server(server, {
    path: "/your-socket-path" // Define path here
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", async () => {
      // Handle disconnect logic here
    });
  });
};
