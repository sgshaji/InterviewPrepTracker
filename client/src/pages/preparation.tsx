import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
    enableDailyReminders: false,
    enableCongratulations: true,
    reminderTimes: ['21:00'], // Times to check and send reminders
    reminderTemplate: `Subject: 🚨 Missing Preparation Entry for {date}

Hi {userName},

We noticed you haven't filled in your preparation log for today, {date}. Here's what's missing:

{missingCategories}

Take 5 minutes to reflect and fill in your prep log to stay consistent.

You've got this!
– Interview Prep Tracker`,
    congratsTemplate: `Subject: 🎉 Great job on your preparation today!

Hi {userName},

Congratulations! You've completed all your preparation categories for {date}:

{completedCategories}

Your consistency is paying off. Keep up the excellent work!

You're building great habits!
– Interview Prep Tracker`
  });

  // Load saved email settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setEmailSettings(parsed);
      } catch (error) {
        console.error('Error loading saved email settings:', error);
      }
    }
  }, []);

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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>📧 Daily Email Notifications</DialogTitle>
                <div className="text-sm text-slate-600">
                  Configure automatic daily emails for preparation tracking
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900">Basic Settings</h3>
                  
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
                </div>

                {/* Notification Types */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900">Notification Types</h3>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Label htmlFor="enable-reminders" className="font-medium text-red-900">🚨 Missing Preparation Alerts</Label>
                        <p className="text-sm text-red-700">High priority emails when you haven't logged preparation</p>
                      </div>
                      <Switch
                        id="enable-reminders"
                        checked={emailSettings.enableDailyReminders}
                        onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableDailyReminders: checked }))}
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="enable-congrats" className="font-medium text-green-900">🎉 Completion Celebrations</Label>
                        <p className="text-sm text-green-700">Positive emails when you complete all prep categories</p>
                      </div>
                      <Switch
                        id="enable-congrats"
                        checked={emailSettings.enableCongratulations}
                        onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableCongratulations: checked }))}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Timing Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900">Check Times</h3>
                  <p className="text-sm text-slate-600">
                    Set times when the system checks your preparation status and sends emails accordingly
                  </p>
                  
                  <div className="space-y-3">
                    {emailSettings.reminderTimes.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm">Check Time {index + 1}</Label>
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...emailSettings.reminderTimes];
                              newTimes[index] = e.target.value;
                              setEmailSettings(prev => ({ ...prev, reminderTimes: newTimes }));
                            }}
                            className="mt-1"
                          />
                        </div>
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
                      className="w-full"
                    >
                      + Add Another Check Time
                    </Button>
                  </div>
                </div>

                {/* Email Templates */}
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900">Email Templates</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reminderTemplate" className="text-red-900 font-medium">🚨 Missing Preparation Alert Template</Label>
                      <Textarea
                        id="reminderTemplate"
                        rows={5}
                        value={emailSettings.reminderTemplate}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, reminderTemplate: e.target.value }))}
                        className="font-mono text-sm mt-2"
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        Variables: {"{date}"}, {"{userName}"}, {"{missingCategories}"}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="congratsTemplate" className="text-green-900 font-medium">🎉 Completion Celebration Template</Label>
                      <Textarea
                        id="congratsTemplate"
                        rows={5}
                        value={emailSettings.congratsTemplate}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, congratsTemplate: e.target.value }))}
                        className="font-mono text-sm mt-2"
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        Variables: {"{date}"}, {"{userName}"}, {"{completedCategories}"}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    className="flex-1" 
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/check-prep-reminders", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            email: emailSettings.email,
                            template: emailSettings.reminderTemplate
                          })
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
                    onClick={async () => {
                      if (!emailSettings.email) {
                        alert('Please enter your email address first.');
                        return;
                      }
                      
                      try {
                        // Save settings to the server
                        const response = await fetch("/api/email-settings", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(emailSettings)
                        });
                        const data = await response.json();
                        
                        if (data.success) {
                          // Also save to localStorage as backup
                          localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
                          alert('✅ Configuration saved! Daily notifications are now active.');
                          setShowEmailConfig(false);
                        } else {
                          alert('❌ Failed to save settings. Please try again.');
                        }
                      } catch (error) {
                        alert('❌ Error saving settings. Please try again.');
                      }
                    }}
                  >
                    💾 Save Settings
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
