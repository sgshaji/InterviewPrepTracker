import { supabase } from "@/lib/supabase";
import { Application } from "@/types";

export async function updateApplication(application: Application): Promise<{ error: string | null }> {
  const { id, ...updates } = application;

  const { error } = await supabase
    .from("applications")
    .update(updates)
    .eq("id", id);

  return { error: error?.message ?? null };
}
