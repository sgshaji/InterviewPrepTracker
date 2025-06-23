import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Briefcase, BarChart3, Book, Calendar, ClipboardCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Applications", href: "/applications", icon: Briefcase },
  { name: "Preparation", href: "/preparation", icon: Book },
  { name: "Interviews", href: "/interviews", icon: Calendar },
  { name: "Self-Assessment", href: "/assessments", icon: ClipboardCheck },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Briefcase className="text-white h-4 w-4" />
          </div>
          <span className="text-lg font-semibold text-slate-900">InterviewPrep</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
