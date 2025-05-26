import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import DailyPrepTable from "@/components/daily-prep-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PreparationSession } from "@shared/schema";
import { Settings, Mail } from "lucide-react";

export default function Preparation() {
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    enableAlerts: false,
    missedDaysThreshold: 2,
    reminderTime: '09:00'
  });

  const { data: sessions, isLoading } = useQuery<PreparationSession[]>({
    queryKey: ["/api/preparation-sessions"],
  });

  return (
    <>
      <Header 
        title="Daily Preparation Tracker" 
        subtitle="Build consistent interview preparation habits with daily progress tracking"
        action={
          <Dialog open={showEmailConfig} onOpenChange={setShowEmailConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                <Mail className="h-4 w-4 mr-2" />
                Email Alerts
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Email Alert Configuration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={emailSettings.email}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-alerts">Enable preparation reminders</Label>
                  <Switch
                    id="enable-alerts"
                    checked={emailSettings.enableAlerts}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableAlerts: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold">Send alert after missing (days)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="7"
                    value={emailSettings.missedDaysThreshold}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, missedDaysThreshold: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Daily reminder time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={emailSettings.reminderTime}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                  />
                </div>
                
                <Button className="w-full" onClick={() => setShowEmailConfig(false)}>
                  Save Alert Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <DailyPrepTable sessions={sessions || []} isLoading={isLoading} />
      </main>
    </>
  );
}
