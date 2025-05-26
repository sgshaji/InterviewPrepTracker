import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {action}
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
