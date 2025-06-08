import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Debug environment variables
console.log('🔍 Environment variables check:', {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
});

// Hardcode the correct URL for now since env vars aren't loading in Replit
const supabaseUrl = "https://bzukbciiqwdckzmwarku.supabase.co";
console.log('🔗 Using Supabase URL:', supabaseUrl);

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    headers: {
      // "Content-Security-Policy": `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ${supabaseUrl}; connect-src 'self' ${supabaseUrl}; img-src 'self' data: https:; font-src 'self' https: data:; frame-src 'self' ${supabaseUrl} https://accounts.google.com; object-src 'none';`,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
