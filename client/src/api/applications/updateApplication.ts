import { type NextApiRequest, type NextApiResponse } from "next";
import { db } from "@/lib/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateApplicationSchema } from "@shared/schema";

export async function updateApplication(data: { id: number; [key: string]: any }) {
  try {
    const response = await fetch('/api/applications/updateApplication', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      return { error: result.error };
    }
    return { data: result };
  } catch (error) {
    return { error: 'Failed to update application' };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, ...data } = req.body;

  // ID validation: ensure it's a number, not undefined or a stringified number
  if (typeof id !== "number" || isNaN(id)) {
    return res.status(400).json({ error: "Missing or invalid application ID" });
  }

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
