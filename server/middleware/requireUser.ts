import { createClient } from "@supabase/supabase-js";
import { type Request, type Response, type NextFunction } from "express";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token" });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  // Attach user to a custom property to avoid conflicts with Express's req.user
  // @ts-ignore
  req.supabaseUser = user;
  next();
}
