import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <nav className="flex flex-col space-y-4">
          <Link to="/" className="text-sm font-medium">Dashboard</Link>
          <Link to="/applications" className="text-sm font-medium">Applications</Link>
          <Link to="/interviews" className="text-sm font-medium">Interviews</Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
} 