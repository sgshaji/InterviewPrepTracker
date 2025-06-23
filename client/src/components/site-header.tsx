import { Link } from "react-router-dom";
import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from '../hooks/use-auth';

export function SiteHeader() {
  const { user } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {user ? (
              <UserNav />
            ) : (
              <Link to="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 