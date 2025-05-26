import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import DailyPrepTable from "@/components/daily-prep-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PreparationSession } from "@shared/schema";
import { Settings, Mail } from "lucide-react";

export default function Preparation() {
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    enableAlerts: false,
    enableCongratulations: true,
    missedDaysThreshold: 2,
    reminderTimes: ['21:00'], // Support multiple reminder times
    reminderTemplate: `Subject: Missing Preparation Entry for {date}

Hi {userName},

We noticed you haven't filled in your preparation log for today, {date}. Here's what's missing:

{missingCategories}

Take 5 minutes to reflect and fill in your prep log to stay consistent.

You've got this!
– Interview Prep Tracker`,
    congratsTemplate: `Subject: Great job on your preparation today! 🎉

Hi {userName},

Congratulations! You've completed all your preparation categories for {date}:

{completedCategories}

Your consistency is paying off. Keep up the excellent work!

You're building great habits!
– Interview Prep Tracker`
  });

  const { data: sessions, isLoading } = useQuery<PreparationSession[]>({
    queryKey: ["/api/preparation-sessions"],
  });

  const saveEmailMutation = useMutation({
    mutationFn: async (settings: typeof emailSettings) => {
      return await apiRequest("/api/email-settings", "POST", settings);
    },
    onSuccess: () => {
      setShowEmailConfig(false);
    }
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-congrats">Send congratulations for completed prep</Label>
                  <Switch
                    id="enable-congrats"
                    checked={emailSettings.enableCongratulations}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableCongratulations: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold">Send alert after missing (days)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    max="7"
                    value={emailSettings.missedDaysThreshold}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, missedDaysThreshold: parseInt(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Daily reminder times</Label>
                  <div className="space-y-2">
                    {emailSettings.reminderTimes.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const newTimes = [...emailSettings.reminderTimes];
                            newTimes[index] = e.target.value;
                            setEmailSettings(prev => ({ ...prev, reminderTimes: newTimes }));
                          }}
                        />
                        {emailSettings.reminderTimes.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newTimes = emailSettings.reminderTimes.filter((_, i) => i !== index);
                              setEmailSettings(prev => ({ ...prev, reminderTimes: newTimes }));
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmailSettings(prev => ({ 
                          ...prev, 
                          reminderTimes: [...prev.reminderTimes, '09:00'] 
                        }));
                      }}
                    >
                      Add Another Time
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderTemplate">Reminder Email Template</Label>
                  <Textarea
                    id="reminderTemplate"
                    rows={6}
                    value={emailSettings.reminderTemplate}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, reminderTemplate: e.target.value }))}
                    placeholder="Customize your reminder email..."
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-slate-500">
                    Available variables: {"{date}"}, {"{userName}"}, {"{missingCategories}"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="congratsTemplate">Congratulations Email Template</Label>
                  <Textarea
                    id="congratsTemplate"
                    rows={6}
                    value={emailSettings.congratsTemplate}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, congratsTemplate: e.target.value }))}
                    placeholder="Customize your congratulations email..."
                    className="font-mono text-sm"
                  />
                  <div className="text-xs text-slate-500">
                    Available variables: {"{date}"}, {"{userName}"}, {"{completedCategories}"}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    className="flex-1" 
                    onClick={async () => {
                      try {
                        const response = await apiRequest("/api/check-prep-reminders", "POST", {
                          email: emailSettings.email,
                          template: emailSettings.reminderTemplate
                        });
                        const data = await response.json();
                        if (data.success) {
                          alert('Test email sent successfully! Check your inbox.');
                        } else {
                          alert('Failed to send test email. Please check your email address.');
                        }
                      } catch (error) {
                        alert('Error sending test email. Please try again.');
                      }
                    }}
                  >
                    Send Test Email
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      console.log('Email settings saved:', emailSettings);
                      setShowEmailConfig(false);
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
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
