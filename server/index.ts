import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler, requestLogger } from "./middleware";
import { startNotificationScheduler } from "./notification-scheduler";
import { cache } from "./cache";
import { setupAuth } from "./auth";
import { setupSecurity } from "./security";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Setup security middleware
setupSecurity(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

(async () => {
  // Initialize Redis cache
  await cache.connect();
  
  // Setup authentication
  setupAuth(app);
  
  const server = await registerRoutes(app);

  app.use(errorHandler);

  // Setup Vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  const host = process.env.HOST || "localhost";
  server.listen(
    Number(port),
    host,
    () => {
      log(`Server running in ${process.env.NODE_ENV} mode on ${host}:${port}`);
    }
  );
})();
