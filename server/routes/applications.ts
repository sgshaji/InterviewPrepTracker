import express from "express";
import { requireUser } from "../middleware/requireUser";
import { db } from "../db";
import { applications } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Protected route: GET /api/applications
router.get("/", requireUser, async (req: any, res) => {
  try {
    // Note: We use req.supabaseUser from our middleware, not req.user
    const userId = req.supabaseUser.id;

    // Use Drizzle's type-safe query builder
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .limit(100);

    res.json({ applications: userApplications });
  } catch (err) {
    console.error("Failed to fetch applications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
