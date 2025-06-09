// client/src/api/applications/updateApplication.ts

import { authorizedFetch } from "@/api/authorizedFetch";
import { type Request, type Response } from "express";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateApplicationSchema } from "@shared/schema";

// ✅ Client-side function to call the API
export async function updateApplication(data: { id: string; [key: string]: any }) {
  try {
    const response = await authorizedFetch("/api/applications/updateApplication", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      return { error: result.error };
    }
    return { data: result };
  } catch (error) {
    return { error: "Failed to update application" };
  }
}

// ✅ API route handler to run on the server
export default async function handler(
  req: Request,
  res: Response
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, ...data } = req.body;

  // Validate ID
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid application ID" });
  }

  // Validate payload with Zod
  const parsed = updateApplicationSchema.safeParse(data);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
  }

  try {
    await db
      .update(applications)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id));

    return res.status(200).json({ message: "Application updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
