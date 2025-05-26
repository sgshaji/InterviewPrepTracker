import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Calendar, Flame, TrendingUp, Building } from "lucide-react";
import PrepTimeChart from "@/components/charts/prep-time-chart";
import ConfidenceChart from "@/components/charts/confidence-chart";
import PreparationProgressChart from "@/components/charts/preparation-progress-chart";
import ApplicationFunnelChart from "@/components/charts/application-funnel-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Application, Interview } from "@shared/schema";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: interviews } = useQuery<(Interview & { application: Application })[]>({
    queryKey: ["/api/interviews"],
  });

  const recentApplications = applications?.slice(0, 3) || [];
  const upcomingInterviews = interviews?.filter(i => i.status === "Scheduled").slice(0, 3) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Applied": "bg-blue-100 text-blue-800",
      "In Progress": "bg-amber-100 text-amber-800",
      "Rejected": "bg-red-100 text-red-800",
      "Offer": "bg-emerald-100 text-emerald-800"
    };
    return variants[status] || "bg-slate-100 text-slate-800";
  };

  return (
    <>
      <Header 
        title="Dashboard" 
        subtitle="Track your interview preparation progress"
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <span className="text-emerald-600 font-medium">+12%</span>
                <span className="text-slate-500 ml-2">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
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
                <span className="text-emerald-600 font-medium">+3</span>
                <span className="text-slate-500 ml-2">this week</span>
              </div>
            </CardContent>
          </Card>

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
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-emerald-600 h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-emerald-600 font-medium">+5%</span>
                <span className="text-slate-500 ml-2">improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PrepTimeChart />
          <ConfidenceChart />
          <PreparationProgressChart />
        </div>

        {/* Application Funnel Section */}
        <div className="mb-8">
          <ApplicationFunnelChart />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Recent Applications</h3>
                <a href="/applications" className="text-primary hover:text-blue-700 font-medium text-sm">View All</a>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        No applications yet. Start by adding your first application.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-3">
                              <Building className="text-slate-500 h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-900">{app.companyName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-slate-900">{app.roleTitle}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusBadge(app.jobStatus)}>
                            {app.jobStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Interviews</h3>
                <a href="/interviews" className="text-primary hover:text-blue-700 font-medium text-sm">View All</a>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {upcomingInterviews.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No upcoming interviews scheduled.
                </div>
              ) : (
                upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Calendar className="text-white h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {interview.application.companyName} - {interview.interviewStage}
                        </div>
                        <div className="text-sm text-slate-500">
                          {interview.interviewDate ? new Date(interview.interviewDate).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-blue-700">
                      Prep
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
