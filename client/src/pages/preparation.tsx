import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Settings, Mail, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { z } from "zod";

// Validation schema
const preparationSessionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  topic: z.string().min(1, "Topic is required"),
  resourceLink: z.string().optional(),
  confidenceScore: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
});

interface FormData {
  date?: string;
  topic?: string;
  resourceLink?: string;
  confidenceScore?: number;
  notes?: string;
}

export default function Preparation() {
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<PreparationSession | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [emailSettings, setEmailSettings] = useState({
    email: '',
    enableDailyReminders: false,
    enableCongratulations: true,
    reminderTimes: ['21:00'],
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

  const createSessionMutation = useMutation({
    mutationFn: async (session: FormData) => {
      return await apiRequest("/api/preparation-sessions", "POST", session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      setShowEditDialog(false);
      setFormData({});
      toast({
        title: "Success",
        children: "Preparation session created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to create preparation session",
        variant: "destructive",
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async (session: PreparationSession) => {
      return await apiRequest(`/api/preparation-sessions/${session.id}`, "PUT", session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      setShowEditDialog(false);
      setEditingSession(null);
      setFormData({});
      toast({
        title: "Success",
        children: "Preparation session updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to update preparation session",
        variant: "destructive",
      });
    },
  });

  const saveEmailMutation = useMutation({
    mutationFn: async (settings: typeof emailSettings) => {
      return await apiRequest("/api/email-settings", "POST", settings);
    },
    onSuccess: () => {
      setShowEmailConfig(false);
      toast({
        title: "Success",
        children: "Email settings saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to save email settings",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (session: PreparationSession) => {
    setEditingSession(session);
    setFormData({
      date: session.date,
      topic: session.topic,
      resourceLink: session.resourceLink || '',
      confidenceScore: session.confidenceScore || 0,
      notes: session.notes || '',
    });
    setShowEditDialog(true);
  };

  const handleCreate = () => {
    setEditingSession(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      topic: '',
      resourceLink: '',
      confidenceScore: 0,
      notes: '',
    });
    setShowEditDialog(true);
  };

  const validateForm = (): boolean => {
    try {
      preparationSessionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        children: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (editingSession) {
      await updateSessionMutation.mutateAsync({ ...editingSession, ...formData });
    } else {
      await createSessionMutation.mutateAsync(formData);
    }
  };

  return (
    <>
      <Header 
        title="Daily Preparation Tracker" 
        subtitle="Build consistent interview preparation habits with daily progress tracking"
        action={
          <div className="flex gap-2">
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
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
          </div>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="container mx-auto py-6">
          <DailyPrepTable 
            sessions={sessions || []} 
            isLoading={isLoading}
          />
        </div>
      </main>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? "Edit Preparation Entry" : "New Preparation Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                className={errors.topic ? "border-red-500" : ""}
              />
              {errors.topic && (
                <p className="text-sm text-red-500 mt-1">{errors.topic}</p>
              )}
            </div>
            <div>
              <Label htmlFor="resourceLink">Resource Link</Label>
              <Input
                id="resourceLink"
                value={formData.resourceLink || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, resourceLink: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="confidenceScore">Confidence Score (0-5)</Label>
              <Input
                id="confidenceScore"
                type="number"
                min="0"
                max="5"
                value={formData.confidenceScore || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, confidenceScore: parseInt(e.target.value) || 0 }))}
                className={errors.confidenceScore ? "border-red-500" : ""}
              />
              {errors.confidenceScore && (
                <p className="text-sm text-red-500 mt-1">{errors.confidenceScore}</p>
              )}
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about your preparation..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
            >
              {createSessionMutation.isPending || updateSessionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
