import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CompanyLogo from "@/components/company-logo";
import { 
  Briefcase, Calendar, Flame, TrendingUp, Building, Target, 
  Clock, CheckCircle, AlertCircle, ArrowRight, Plus, BookOpen,
  Trophy, Star, Zap, Coffee, Brain, Users, BarChart3, Settings
} from "lucide-react";
import PrepTimeChart from "@/components/charts/prep-time-chart";
import ConfidenceChart from "@/components/charts/confidence-chart";
import PreparationProgressChart from "@/components/charts/preparation-progress-chart";
import ApplicationFunnelChart from "@/components/charts/application-funnel-chart";
import { Application, Interview, PreparationSession } from "@shared/schema";
import { useNavigate } from "react-router-dom";
import { format, startOfWeek, endOfWeek, isWithinInterval, addDays, differenceInDays } from "date-fns";
import { api } from "@/utils/api";
import { useAuth } from "../hooks/use-auth";

// Direct Clearbit logo component matching applications page
function DirectCompanyLogo({ companyName }: { companyName: string }) {
  const getDomain = (name: string) => {
    const cleanName = name.toLowerCase().trim()
    const domainMap: Record<string, string> = {
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'apple': 'apple.com',
      'amazon': 'amazon.com',
      'meta': 'meta.com',
      'facebook': 'meta.com',
      'netflix': 'netflix.com',
      'uber': 'uber.com',
      'airbnb': 'airbnb.com',
      'spotify': 'spotify.com',
      'linkedin': 'linkedin.com',
      'twitter': 'x.com',
      'tesla': 'tesla.com',
      'salesforce': 'salesforce.com',
      'adobe': 'adobe.com',
      'oracle': 'oracle.com',
      'ibm': 'ibm.com',
      'intel': 'intel.com',
      'nvidia': 'nvidia.com',
      'paypal': 'paypal.com',
      'stripe': 'stripe.com',
      'shopify': 'shopify.com',
      'zoom': 'zoom.us',
      'slack': 'slack.com',
      'dropbox': 'dropbox.com',
      'atlassian': 'atlassian.com',
      'figma': 'figma.com',
      'notion': 'notion.so',
      'wayfair': 'wayfair.com',
      'miro': 'miro.com',
      'intuit': 'intuit.com',
      'target': 'target.com'
    }
    
    if (domainMap[cleanName]) return domainMap[cleanName]
    
    for (const [key, domain] of Object.entries(domainMap)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return domain
      }
    }
    
    return `${cleanName.replace(/[^a-z0-9]/g, '')}.com`
  }

  const domain = getDomain(companyName)
  const clearbitUrl = `https://logo.clearbit.com/${domain}`
  const initials = companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  
  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center shadow-sm">
      <img
        src={clearbitUrl}
        alt={`${companyName} logo`}
        className="w-10 h-10 object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="text-xs font-semibold text-gray-600">${initials}</div>`
            parent.className = "w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm"
          }
        }}
      />
    </div>
  )
}

type DashboardStats = {
  totalApplications: number;
  activeInterviews: number;
  prepStreak: number;
  successRate: number;
  weeklyGoal: number;
  weeklyProgress: number;
  avgConfidence: number;
  totalPrepHours: number;
  interviewsThisWeek: number;
  preparationSessions: number;
};

type WeeklyGoal = {
  applications: number;
  prepHours: number;
  confidenceTarget: number;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated) return (
    <div className="flex items-center justify-center h-screen">
      <span className="text-sm text-gray-500">Checking authentication...</span>
    </div>
  );

  // State for customizable weekly goals
  const [weeklyGoalsDialogOpen, setWeeklyGoalsDialogOpen] = useState(false);
  const [customGoals, setCustomGoals] = useState<WeeklyGoal>({
    applications: 5,
    prepHours: 10,
    confidenceTarget: 4.0
  });

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('weeklyGoals');
    if (savedGoals) {
      setCustomGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage
  const saveWeeklyGoals = (goals: WeeklyGoal) => {
    setCustomGoals(goals);
    localStorage.setItem('weeklyGoals', JSON.stringify(goals));
    setWeeklyGoalsDialogOpen(false);
  };
  
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.get<DashboardStats>("/dashboard/stats"),
  });

  const { data: applicationsData } = useQuery<{ totalCount: number; applications: Application[] }>({
    queryKey: ["/api/applications"],
    queryFn: () => api.get<{ totalCount: number; applications: Application[] }>("/applications"),
  });

  const applications = applicationsData?.applications || [];

  const { data: interviews } = useQuery<(Interview & { application: Application })[]>({
    queryKey: ["/api/interviews"],
    queryFn: () => api.get<(Interview & { application: Application })[]>("/interviews"),
  });

  const { data: sessions } = useQuery<PreparationSession[]>({
    queryKey: ["/api/preparation-sessions"],
    queryFn: () => api.get<PreparationSession[]>("/preparation-sessions"),
  });

  // Calculate real-time insights
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  
  const thisWeekApplications = applications.filter(app => 
    isWithinInterval(new Date(app.dateApplied), { start: thisWeekStart, end: thisWeekEnd })
  ).length;

  const thisWeekSessions = sessions?.filter(session =>
    isWithinInterval(new Date(session.date), { start: thisWeekStart, end: thisWeekEnd })
  ).length || 0;

  const recentApplications = applications.slice(0, 4);
  const upcomingInterviews = interviews?.filter(i => i.status === "Scheduled")
    .sort((a, b) => new Date(a.interviewDate || 0).getTime() - new Date(b.interviewDate || 0).getTime())
    .slice(0, 3) || [];

  // Use custom weekly goals
  const weeklyGoals = customGoals;

  // Calculate goal progress
  const applicationProgress = Math.min((thisWeekApplications / weeklyGoals.applications) * 100, 100);
  const prepProgress = Math.min((thisWeekSessions / (weeklyGoals.prepHours * 2)) * 100, 100); // Assuming 30min per session
  const confidenceProgress = Math.min(((stats?.avgConfidence || 0) / weeklyGoals.confidenceTarget) * 100, 100);

  // Mock achievements (would be calculated from real data)
  const achievements: Achievement[] = [
    {
      id: "streak_5",
      title: "Consistency Champion",
      description: "5-day preparation streak",
      icon: "🔥",
      unlocked: (stats?.prepStreak || 0) >= 5,
      progress: stats?.prepStreak || 0,
      maxProgress: 5
    },
    {
      id: "applications_10",
      title: "Application Master",
      description: "Submit 10 applications",
      icon: "📝",
      unlocked: (stats?.totalApplications || 0) >= 10,
      progress: stats?.totalApplications || 0,
      maxProgress: 10
    },
    {
      id: "confidence_boost",
      title: "Confidence Booster",
      description: "Average confidence above 4.0",
      icon: "⭐",
      unlocked: (stats?.avgConfidence || 0) >= 4.0,
      progress: stats?.avgConfidence || 0,
      maxProgress: 5
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Applied": "bg-blue-100 text-blue-800",
      "In Progress": "bg-amber-100 text-amber-800", 
      "Rejected": "bg-red-100 text-red-800",
      "Offer": "bg-emerald-100 text-emerald-800"
    };
    return variants[status] || "bg-slate-100 text-slate-800";
  };

  const getNextAction = () => {
    if (applications.length === 0) {
      return {
        title: "Start Your Journey",
        description: "Add your first job application to begin tracking",
        action: "Add Application",
        link: "/applications",
        priority: "high"
      };
    }
    
    if (thisWeekSessions === 0) {
      return {
        title: "Time to Prepare",
        description: "No preparation sessions this week yet",
        action: "Start Preparing",
        link: "/preparation",
        priority: "high"
      };
    }

    if (upcomingInterviews.length > 0) {
      const nextInterview = upcomingInterviews[0];
      const daysUntil = differenceInDays(new Date(nextInterview.interviewDate || 0), new Date());
      return {
        title: "Interview Coming Up",
        description: `${nextInterview.application.companyName} interview in ${daysUntil} days`,
        action: "Prepare Now",
        link: "/preparation",
        priority: "urgent"
      };
    }

    return {
      title: "Keep Momentum",
      description: "Great progress! Consider adding more applications",
      action: "Add Application",
      link: "/applications", 
      priority: "medium"
    };
  };

  const nextAction = getNextAction();

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Your interview success command center"
      />
      
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Hero Section with Next Action */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {nextAction.title}
              </h2>
              <p className="text-slate-600 mb-4 max-w-md">
                {nextAction.description}
              </p>
              <Button 
                onClick={() => navigate(nextAction.link)}
                className={`${
                  nextAction.priority === 'urgent' ? 'bg-red-600 hover:bg-red-700' :
                  nextAction.priority === 'high' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                {nextAction.action}
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Goals Progress */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Weekly Goals
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-slate-600">
                  {format(thisWeekStart, 'MMM d')} - {format(thisWeekEnd, 'MMM d')}
                </Badge>
                <Dialog open={weeklyGoalsDialogOpen} onOpenChange={setWeeklyGoalsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Customize Weekly Goals</DialogTitle>
                      <DialogDescription>
                        Set your personal targets for each week to stay motivated and track progress.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="applications" className="text-right">
                          Applications
                        </Label>
                        <Input
                          id="applications"
                          type="number"
                          min="1"
                          max="50"
                          defaultValue={customGoals.applications}
                          className="col-span-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="prepHours" className="text-right">
                          Prep Hours
                        </Label>
                        <Input
                          id="prepHours"
                          type="number"
                          min="1"
                          max="100"
                          defaultValue={customGoals.prepHours}
                          className="col-span-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="confidence" className="text-right">
                          Confidence Target
                        </Label>
                        <Input
                          id="confidence"
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          defaultValue={customGoals.confidenceTarget}
                          className="col-span-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        onClick={() => {
                          const applications = parseInt((document.getElementById('applications') as HTMLInputElement).value);
                          const prepHours = parseInt((document.getElementById('prepHours') as HTMLInputElement).value);
                          const confidenceTarget = parseFloat((document.getElementById('confidence') as HTMLInputElement).value);
                          
                          saveWeeklyGoals({
                            applications,
                            prepHours,
                            confidenceTarget
                          });
                        }}
                      >
                        Save Goals
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Applications</span>
                  <span className="text-sm text-slate-500">{thisWeekApplications}/{weeklyGoals.applications}</span>
                </div>
                <Progress value={applicationProgress} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Prep Sessions</span>
                  <span className="text-sm text-slate-500">{thisWeekSessions}/{weeklyGoals.prepHours * 2}</span>
                </div>
                <Progress value={prepProgress} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Avg Confidence</span>
                  <span className="text-sm text-slate-500">{(stats?.avgConfidence || 0).toFixed(1)}/{weeklyGoals.confidenceTarget}</span>
                </div>
                <Progress value={confidenceProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalApplications || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-blue-600 h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-600 font-medium">+{thisWeekApplications}</span>
                <span className="text-slate-500 ml-2">this week</span>
              </div>
            </CardContent>
          </Card>

          <div className="cursor-pointer" onClick={() => navigate("/applications?interviewing=true")}>
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Active Interviews</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.activeInterviews || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-amber-600 h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <span className="text-amber-600 font-medium">{stats?.interviewsThisWeek || 0}</span>
                  <span className="text-slate-500 ml-2">this week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Prep Streak</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.prepStreak || 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Flame className="text-emerald-600 h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-slate-500">days in a row</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.successRate || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-purple-600 h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-600 font-medium">Trending up</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                Achievements
              </h3>
              <Badge variant="secondary">
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.unlocked 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-yellow-800' : 'text-slate-600'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-slate-500">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.maxProgress && (
                    <div className="mt-2">
                      <Progress 
                        value={(achievement.progress! / achievement.maxProgress) * 100} 
                        className="h-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {achievement.progress}/{achievement.maxProgress}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PrepTimeChart />
          <ConfidenceChart />
          <PreparationProgressChart />
        </div>

        {/* Application Funnel Section */}
        <ApplicationFunnelChart applications={applications} />

        {/* Enhanced Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Applications</h3>
                <Button variant="outline" size="sm" onClick={() => navigate("/applications")}>
                  <ArrowRight className="h-4 w-4 ml-1" />
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No applications yet</p>
                  <Button onClick={() => navigate("/applications")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Application
                  </Button>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <DirectCompanyLogo companyName={app.companyName} />
                      <div>
                        <div className="font-medium text-slate-900">{app.companyName}</div>
                        <div className="text-sm text-slate-500">{app.roleTitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusBadge(app.jobStatus)}>
                        {app.jobStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Interviews with Enhanced Actions */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Interviews</h3>
                <Button variant="outline" size="sm" onClick={() => navigate("/interviews")}>
                  <ArrowRight className="h-4 w-4 ml-1" />
                  View All
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No upcoming interviews</p>
                  <p className="text-sm text-slate-400">Interviews will appear here once scheduled</p>
                </div>
              ) : (
                upcomingInterviews.map((interview) => {
                  const daysUntil = differenceInDays(new Date(interview.interviewDate || 0), new Date());
                  const isUrgent = daysUntil <= 2;
                  
                  return (
                    <div key={interview.id} className={`p-4 rounded-lg border-2 ${
                      isUrgent ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <DirectCompanyLogo companyName={interview.application.companyName} />
                            {isUrgent && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                <Clock className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {interview.application.companyName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {interview.interviewStage} • {daysUntil === 0 ? 'Today' : 
                               daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => navigate("/preparation")}
                          className={isUrgent ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Prep
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
