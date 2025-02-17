import { Application, Express, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import getLogger from "../utils/logger";
const packageJson = require("../../package.json");
const version = packageJson.version;

dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Child Growth Tracking System API Docs",
      version,
      description:
        "Swagger",
      contact: {
        name: "Github",
        url: "https://github.com/ellie2222222/child-growth-tracking-system-server",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.DEVELOPMENT_PORT || 4000}`,
        description: "Development server",
      },
    ],
    tags: [
      { name: "Auth", description: "Operations about Authorization" },
      { name: "Users", description: "Operations about users" },
      { name: "Membership Packages", description: "Operations about membership packages" },
      { name: "Posts", description: "Operations about posts" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.ts", "./interfaces/*.ts", "./enums/*.ts", "./swagger/*.ts", "./**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDoc(app: Application): void {
  const logger = getLogger("SWAGGER");

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        docExpansion: "none",
        filter: true,
        persistAuthorization: true,
      },
      explorer: true,
    })
  );

  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(`Swagger is running at: ${process.env.SERVER_URL}/api-docs`);
}