import express from "express";
import applications from "./applications";
import dailyGoals from "./daily-goals";

export function registerRoutes(app: express.Express) {
  const apiRouter = express.Router();

  apiRouter.use("/applications", applications);
  apiRouter.use("/daily-goals", dailyGoals);

  app.use("/api", apiRouter);

  return app;
}

