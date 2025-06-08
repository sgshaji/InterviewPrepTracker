import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler, requestLogger } from "./middleware";
import { startNotificationScheduler } from "./notification-scheduler";
import { cache } from "./cache";
import { setupAuth } from "./auth";
import { setupSupabaseAuth } from "./supabase-auth";
import { setupSecurity } from "./security";
import dotenv from "dotenv";

// Load environment variables before any other imports
dotenv.config();

// Verify environment variables are loaded
console.log("Environment Check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
});

const app = express();

// ❌ Removed redundant manual CSP override; Helmet handles this via security.ts

// Setup security middleware
setupSecurity(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

(async () => {
  // Initialize Redis cache (non-blocking)
  try {
    await cache.connect();
  } catch (error) {
    console.warn("⚠️  Cache initialization failed, continuing without cache:", error);
  }

  // Setup authentication
  setupAuth(app);
  setupSupabaseAuth(app);

  const server = await registerRoutes(app);

  app.use(errorHandler);

  // Setup Vite in development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on http://localhost:${port}`, "server");
  });
})();
