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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreparationSession } from "@shared/schema";
import { Settings, Mail, Plus, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import StarRating from "@/components/star-rating";

// Available preparation topics
const PREPARATION_TOPICS = [
  "Behavioral",
  "Product Thinking", 
  "Analytical Thinking",
  "Product Portfolio",
  "Technical Skills",
  "Case Studies",
  "System Design",
  "Leadership",
  "Communication",
  "Market Research"
];

// Single topic entry validation
const topicEntrySchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  confidenceScore: z.number().min(0).max(5),
  notes: z.string().optional(),
  resourceLink: z.string().optional(),
});

// Multi-topic form validation
const multiTopicFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  entries: z.array(topicEntrySchema).min(1, "At least one topic entry is required").max(10, "Maximum 10 topics per day"),
});

interface TopicEntry {
  topic: string;
  confidenceScore: number;
  notes?: string;
  resourceLink?: string;
}

interface MultiTopicFormData {
  date: string;
  entries: TopicEntry[];
}

export default function Preparation() {
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState<MultiTopicFormData>({
    date: new Date().toISOString().split('T')[0],
    entries: [{ topic: '', confidenceScore: 0, notes: '', resourceLink: '' }]
  });
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

  const createSessionsMutation = useMutation({
    mutationFn: async (entries: TopicEntry[]) => {
      // Submit each topic entry as a separate request
      const promises = entries.map(entry => 
        apiRequest("POST", "/api/preparation-sessions", {
          date: formData.date,
          topic: entry.topic,
          confidenceScore: entry.confidenceScore,
          notes: entry.notes || '',
          resourceLink: entry.resourceLink || ''
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preparation-sessions"] });
      setShowEditDialog(false);
      resetForm();
      toast({
        title: "Success",
        children: `${formData.entries.length} preparation session${formData.entries.length > 1 ? 's' : ''} created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to create preparation sessions",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      entries: [{ topic: '', confidenceScore: 0, notes: '', resourceLink: '' }]
    });
    setErrors({});
  };

  const addTopicEntry = () => {
    if (formData.entries.length < 10) {
      setFormData(prev => ({
        ...prev,
        entries: [...prev.entries, { topic: '', confidenceScore: 0, notes: '', resourceLink: '' }]
      }));
    }
  };

  const removeTopicEntry = (index: number) => {
    if (formData.entries.length > 1) {
      setFormData(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTopicEntry = (index: number, field: keyof TopicEntry, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const validateForm = (): boolean => {
    try {
      multiTopicFormSchema.parse(formData);
      
      // Check for duplicate topics
      const topicCounts = formData.entries.reduce((acc, entry) => {
        if (entry.topic) {
          acc[entry.topic] = (acc[entry.topic] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const duplicates = Object.entries(topicCounts).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        setErrors({ general: `Duplicate topics not allowed: ${duplicates.map(([topic]) => topic).join(', ')}` });
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
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

    // Filter out entries without topics
    const validEntries = formData.entries.filter(entry => entry.topic.trim());
    
    if (validEntries.length === 0) {
      toast({
        title: "Error", 
        children: "Please add at least one topic",
        variant: "destructive",
      });
      return;
    }

    await createSessionsMutation.mutateAsync(validEntries);
  };

  const handleCreate = () => {
    resetForm();
    setShowEditDialog(true);
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              New Multi-Topic Preparation Entry
            </DialogTitle>
            <div className="text-sm text-slate-600">
              Add multiple preparation topics in a single entry
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Date Selection */}
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            {/* Topic Entries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Preparation Topics</Label>
                <span className="text-sm text-slate-500">{formData.entries.length}/10 topics</span>
              </div>
              
              {formData.entries.map((entry, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Topic {index + 1}</span>
                    {formData.entries.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTopicEntry(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Topic *</Label>
                      <Select
                        value={entry.topic}
                        onValueChange={(value) => updateTopicEntry(index, 'topic', value)}
                      >
                        <SelectTrigger className={errors[`entries.${index}.topic`] ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {PREPARATION_TOPICS.filter(topic => 
                            !formData.entries.some((e, i) => i !== index && e.topic === topic)
                          ).map((topic) => (
                            <SelectItem key={topic} value={topic}>
                              {topic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`entries.${index}.topic`] && (
                        <p className="text-sm text-red-500">{errors[`entries.${index}.topic`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Confidence Score</Label>
                      <div className="flex items-center space-x-2">
                        <StarRating
                          value={entry.confidenceScore}
                          onChange={(value) => updateTopicEntry(index, 'confidenceScore', value)}
                          size="sm"
                        />
                        <span className="text-sm text-slate-500">
                          {entry.confidenceScore}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={entry.notes || ''}
                        onChange={(e) => updateTopicEntry(index, 'notes', e.target.value)}
                        placeholder={`Add notes about your ${entry.topic || 'topic'} preparation...`}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Resource Link</Label>
                      <Input
                        value={entry.resourceLink || ''}
                        onChange={(e) => updateTopicEntry(index, 'resourceLink', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.entries.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTopicEntry}
                  className="w-full border-dashed border-2 border-slate-300 hover:border-slate-400 py-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Topic
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createSessionsMutation.isPending}
            >
              {createSessionsMutation.isPending ? (
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
