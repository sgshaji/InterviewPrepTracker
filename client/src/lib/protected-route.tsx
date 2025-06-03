import React from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // ⚠️ Auth temporarily disabled for local dev
  return <>{children}</>;
}
