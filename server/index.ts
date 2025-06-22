import dotenv from "dotenv";
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler, requestLogger } from "./middleware";
import { startNotificationScheduler } from "./notification-scheduler";
import { cache } from "./cache";
import { setupSupabaseAuth } from "./supabase-auth";
import { setupSecurity } from "./security";


// Load environment variables before any other imports
dotenv.config();

// Verify environment variables are loaded
console.log("Environment Check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
});

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

// Disable CSP for development
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "");
  next();
});

(async () => {
  // Initialize Redis cache (non-blocking)
  try {
    await cache.connect();
  } catch (error) {
    console.warn("⚠️  Cache initialization failed, continuing without cache:", error);
  }

  // Setup authentication
  setupSupabaseAuth(app);

  // Setup security middleware (after disabling CSP)
  setupSecurity(app);

  // Register API routes BEFORE Vite middleware to prevent interception
  const server = await registerRoutes(app);

  // Setup Vite in development (after API routes)
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use(errorHandler);

  // Start the server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`Server running on http://localhost:${port}`, "server");
  });
})();