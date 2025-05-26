import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Plus, Trash2 } from "lucide-react";
import { Application } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JOB_STATUSES, APPLICATION_STAGES, MODES_OF_APPLICATION, ROLE_TITLES } from "@/lib/constants";
import NotionCell from "@/components/notion-cell";

interface ApplicationTableProps {
  applications: Application[];
  isLoading: boolean;
}

export default function ApplicationTable({ applications, isLoading }: ApplicationTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Application> }) => {
      await apiRequest("PUT", `/api/applications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: () => {
      toast({ title: "Failed to update application", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Application>) => {
      await apiRequest("POST", "/api/applications", {
        ...data,
        dateApplied: data.dateApplied || new Date().toISOString().split('T')[0],
        jobStatus: data.jobStatus || "Applied",
        applicationStage: data.applicationStage || "In Review"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({ title: "Failed to create application", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({ title: "Application deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete application", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Applied": "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm",
      "In Progress": "bg-amber-100 text-amber-700 border border-amber-200 shadow-sm animate-pulse",
      "Rejected": "bg-red-100 text-red-700 border border-red-200 shadow-sm",
      "Offer": "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm ring-2 ring-emerald-200"
    };
    return variants[status] || "bg-slate-100 text-slate-700 border border-slate-200";
  };

  const getStageBadge = (stage: string, status: string) => {
    // If status is rejected, always use red regardless of stage
    if (status === "Rejected") {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    
    // If status is offer, always use green regardless of stage
    if (status === "Offer") {
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
    
    // Progressive color coding based on interview stage advancement
    const stageColors: Record<string, string> = {
      "No Callback": "bg-gray-100 text-gray-600 border border-gray-200",
      "In Review": "bg-blue-50 text-blue-600 border border-blue-200",
      "HR Round": "bg-cyan-100 text-cyan-700 border border-cyan-200",
      "Hiring Manager Round": "bg-purple-100 text-purple-700 border border-purple-200",
      "Case Study/Assignment": "bg-orange-100 text-orange-700 border border-orange-200",
      "Panel Interview": "bg-indigo-100 text-indigo-700 border border-indigo-200",
      "Final Round": "bg-amber-100 text-amber-700 border border-amber-200",
      "Offer": "bg-emerald-100 text-emerald-700 border border-emerald-200"
    };
    
    return stageColors[stage] || "bg-slate-100 text-slate-700 border border-slate-200";
  };

  const handleCellUpdate = (id: number, field: keyof Application, value: string) => {
    updateMutation.mutate({ id, data: { [field]: value } });
  };

  // Format date as "DD MMM YY" (e.g., "26 May 25")
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  };

  const handleAddNew = () => {
    createMutation.mutate({
      companyName: "",
      roleTitle: "Senior Product Manager",
      modeOfApplication: "Company Site"
    });
  };

  // Sort applications: non-rejected first (by date desc), then rejected at bottom (by date desc)
  const sortedApplications = [...applications].sort((a, b) => {
    const aIsRejected = a.jobStatus === "Rejected";
    const bIsRejected = b.jobStatus === "Rejected";
    
    // If one is rejected and other isn't, non-rejected comes first
    if (aIsRejected && !bIsRejected) return 1;
    if (!aIsRejected && bIsRejected) return -1;
    
    // Both are same status, sort by date descending (newest first)
    return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
  });

  // Helper functions to determine if a field should be readonly
  const isDateInPast = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const shouldDisableFollowUp = (application: Application) => {
    return application.jobStatus === "Rejected" || isDateInPast(application.followUpDate || "");
  };

  // Function to get company logo from Clearbit API (reliable company logos)
  const getCompanyLogo = (companyName: string) => {
    if (!companyName) return null;
    const domain = getCompanyDomain(companyName);
    return `https://logo.clearbit.com/${domain}`;
  };

  // Helper to map company names to their domains
  const getCompanyDomain = (companyName: string) => {
    const domainMap: Record<string, string> = {
      'Meta': 'meta.com',
      'Microsoft': 'microsoft.com',
      'Apple': 'apple.com',
      'Google': 'google.com',
      'Amazon': 'amazon.com',
      'Netflix': 'netflix.com',
      'Spotify': 'spotify.com',
      'Adobe': 'adobe.com',
      'Salesforce': 'salesforce.com',
      'Oracle': 'oracle.com',
      'Atlassian': 'atlassian.com',
      'Uber': 'uber.com',
      'PayPal': 'paypal.com',
      'Paypal': 'paypal.com',
      'LinkedIn': 'linkedin.com',
      'Twitter': 'twitter.com',
      'Slack': 'slack.com',
      'Zoom': 'zoom.us',
      'Dropbox': 'dropbox.com',
      'Airbnb': 'airbnb.com',
      'Tesla': 'tesla.com',
      'JPMC': 'jpmorgan.com',
      'Goldman Sachs': 'goldmansachs.com',
      'Morgan Stanley': 'morganstanley.com',
      'Bloomberg': 'bloomberg.com',
      'Coinbase': 'coinbase.com',
      'Stripe': 'stripe.com',
      'Square': 'squareup.com',
      'Robinhood': 'robinhood.com',
      'Palantir': 'palantir.com',
      'Snowflake': 'snowflake.com',
      'Databricks': 'databricks.com',
      'MongoDB': 'mongodb.com',
      'Redis': 'redis.com',
      'Elastic': 'elastic.co',
      'Cloudflare': 'cloudflare.com',
      'Twilio': 'twilio.com',
      'SendGrid': 'sendgrid.com',
      'Okta': 'okta.com',
      'Auth0': 'auth0.com',
      'Figma': 'figma.com',
      'Notion': 'notion.so',
      'Airtable': 'airtable.com',
      'HubSpot': 'hubspot.com',
      'Zendesk': 'zendesk.com',
      'Intercom': 'intercom.com',
      'Mailchimp': 'mailchimp.com',
      'Canva': 'canva.com',
      'Shopify': 'shopify.com',
      'Squarespace': 'squarespace.com',
      'Wix': 'wix.com',
      'GitHub': 'github.com',
      'GitLab': 'gitlab.com',
      'Bitbucket': 'bitbucket.org',
      'Docker': 'docker.com',
      'Kubernetes': 'kubernetes.io',
      'Jenkins': 'jenkins.io',
      'CircleCI': 'circleci.com',
      'Travis CI': 'travis-ci.org',
      'Heroku': 'heroku.com',
      'Vercel': 'vercel.com',
      'Netlify': 'netlify.com',
      'AWS': 'aws.amazon.com',
      'GCP': 'cloud.google.com',
      'Azure': 'azure.microsoft.com',
      'DigitalOcean': 'digitalocean.com',
      'Linode': 'linode.com',
      'Vultr': 'vultr.com',
      'JetBrains': 'jetbrains.com',
      'IntelliJ': 'jetbrains.com',
      'Wolt': 'wolt.com',
      'Wise': 'wise.com',
      'N26': 'n26.com',
      'Bolt': 'bolt.eu',
      'Trivago': 'trivago.com',
      'Zalando': 'zalando.com',
      'Deliveryhero': 'deliveryhero.com',
      'DeliveryHero': 'deliveryhero.com',
      'HelloFresh': 'hellofresh.com',
      'Babbel': 'babbel.com',
      'Taxfix': 'taxfix.com',
      'Miro': 'miro.com',
      'Confluence': 'atlassian.com',
      'Intuit': 'intuit.com',
      'Target': 'target.com',
      'Walmart': 'walmart.com',
      'Siemens': 'siemens.com',
      'Arm': 'arm.com',
      'Deel': 'deel.com',
      'Datadog': 'datadoghq.com',
      'NetApp': 'netapp.com',
      'RedHat': 'redhat.com',
      'Redhat': 'redhat.com',
      'NewRelic': 'newrelic.com',
      'Bluecore': 'bluecore.com',
      'Instapro': 'instapro.group',
      'Viator': 'viator.com',
      'PayU': 'payu.com',
      'Lloyds Bank': 'lloydsbank.com',
      'Wayfair': 'wayfair.com'
    };
    
    return domainMap[companyName] || `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
          <h3 className="text-white font-semibold text-lg">Application Tracker</h3>
          <p className="text-slate-300 text-sm mt-1">Click any cell to edit • {applications.length} total applications</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[100px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[160px]">
                  <div className="flex items-center space-x-2">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span>Company</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[140px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Role</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[100px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[120px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Stage</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[100px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span>Resume</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[110px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Applied Via</span>
                  </div>
                </th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {/* Add new row at the top */}
              <tr className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 transition-all duration-300">
                <td colSpan={8} className="px-6 py-4">
                  <Button
                    variant="ghost"
                    onClick={handleAddNew}
                    disabled={createMutation.isPending}
                    className="w-full h-10 text-slate-600 hover:text-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-300 rounded-xl group"
                  >
                    <Plus className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">
                      {createMutation.isPending ? "Adding new application..." : "Add New Application"}
                    </span>
                  </Button>
                </td>
              </tr>
              
              {applications.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-slate-500">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
                      <p>Click the + button above to add your first application.</p>
                    </div>
                  </td>
                </tr>
              )}
              {sortedApplications.map((application, index) => {
                const isRejected = application.jobStatus === "Rejected";
                return (
                <tr key={application.id} className={`transition-all duration-300 group border-l-4 ${
                  isRejected 
                    ? "bg-red-50/50 hover:bg-red-50 border-l-red-300 opacity-75" 
                    : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-l-transparent hover:border-l-blue-400"
                }`}>
                  <td className="px-3 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                      <div className="min-w-[80px]">
                        <NotionCell
                          type="date"
                          value={application.dateApplied}
                          onSave={(value) => handleCellUpdate(application.id, "dateApplied", value)}
                          className="font-medium text-sm"
                          readOnly={isDateInPast(application.dateApplied)}
                        />
                        <div className="text-xs text-slate-500 mt-1">
                          {formatDate(application.dateApplied)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden">
                        {application.companyName ? (
                          <img
                            src={getCompanyLogo(application.companyName) || ""}
                            alt={`${application.companyName} logo`}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Building className="text-slate-500 h-4 w-4 hidden" />
                      </div>
                      <NotionCell
                        value={application.companyName}
                        onSave={(value) => handleCellUpdate(application.id, "companyName", value)}
                        placeholder="Company name"
                        className="font-semibold text-slate-800 text-sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <NotionCell
                      type="select"
                      value={application.roleTitle || "Senior Product Manager"}
                      onSave={(value) => handleCellUpdate(application.id, "roleTitle", value)}
                      options={ROLE_TITLES}
                      placeholder="Role title"
                      className="font-medium text-slate-700 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(application.jobStatus)}`}>
                        {application.jobStatus}
                      </div>
                      <NotionCell
                        type="select"
                        value={application.jobStatus}
                        onSave={(value) => handleCellUpdate(application.id, "jobStatus", value)}
                        options={JOB_STATUSES}
                        className="text-sm opacity-0 hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStageBadge(application.applicationStage || "In Review", application.jobStatus)}`}>
                        {application.applicationStage || "In Review"}
                      </div>
                      <NotionCell
                        type="select"
                        value={application.applicationStage || "In Review"}
                        onSave={(value) => handleCellUpdate(application.id, "applicationStage", value)}
                        options={APPLICATION_STAGES}
                        className="text-sm opacity-0 hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <NotionCell
                      value={application.resumeVersion || ""}
                      onSave={(value) => handleCellUpdate(application.id, "resumeVersion", value)}
                      placeholder="Resume version"
                      className="text-slate-600 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <NotionCell
                      type="select"
                      value={application.modeOfApplication || "Company Site"}
                      onSave={(value) => handleCellUpdate(application.id, "modeOfApplication", value)}
                      options={MODES_OF_APPLICATION}
                      placeholder="Select mode"
                      className="text-slate-600 text-sm"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => deleteMutation.mutate(application.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
