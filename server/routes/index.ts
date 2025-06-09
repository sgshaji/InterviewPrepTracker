import express from "express";
import applications from "./applications";

export function registerRoutes(app: express.Express) {
  const apiRouter = express.Router();

  apiRouter.use("/applications", applications);

  app.use("/api", apiRouter);

  return app;
}

