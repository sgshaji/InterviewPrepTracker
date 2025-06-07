import { Sankey, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Application } from "@shared/schema";

// Color scheme for consistent visual hierarchy
const colors = {
  total: "#64748b",        // Slate gray for starting point
  hrScreen: "#3b82f6",     // Blue for HR stage
  technical: "#1d4ed8",    // Darker blue for technical
  final: "#1e40af",        // Even darker blue for final
  offers: "#16a34a",       // Green for success
  rejected: "#dc2626"      // Single red for all rejections
};

// Simplified Sankey Data Calculation
function calculateSankeyData(applications: Application[]) {
  const totalApplications = applications.length;

  // Calculate actual progression through stages
  const reachedHR = applications.filter(app => {
    const stage = app.applicationStage;
    return stage && !["No Callback", "In Review"].includes(stage);
  });

  const reachedTechnical = applications.filter(app => {
    const stage = app.applicationStage;
    return stage && ["Hiring Manager Round", "Case Study/Assignment", "Panel Interview", "Final Round", "Offer"].includes(stage);
  });

  const reachedFinal = applications.filter(app => {
    const stage = app.applicationStage;
    return stage && ["Panel Interview", "Final Round", "Offer"].includes(stage);
  });

  const offers = applications.filter(app => 
    app.applicationStage === "Offer" || app.jobStatus === "Offer"
  );

  // Calculate dropoffs (rejections are implicit)
  const noResponse = totalApplications - reachedHR.length;
  const rejectedAtHR = reachedHR.length - reachedTechnical.length;
  const rejectedAtTechnical = reachedTechnical.length - reachedFinal.length;
  const rejectedAtFinal = reachedFinal.length - offers.length;

  const nodes = [
    { name: `Total Applications\n(${totalApplications})` },
    { name: `No Response\n(${noResponse})` },
    { name: `HR Screen\n(${reachedHR.length})` },
    { name: `Rejected at HR\n(${rejectedAtHR})` },
    { name: `Technical Round\n(${reachedTechnical.length})` },
    { name: `Rejected at Technical\n(${rejectedAtTechnical})` },
    { name: `Final Round\n(${reachedFinal.length})` },
    { name: `Rejected at Final\n(${rejectedAtFinal})` },
    { name: `Offers\n(${offers.length})` }
  ];

  // Define colors array that matches node order
  const nodeColors = [
    colors.total,     // Total Applications
    colors.rejected,  // No Response
    colors.hrScreen,  // HR Screen
    colors.rejected,  // Rejected at HR
    colors.technical, // Technical Round
    colors.rejected,  // Rejected at Technical
    colors.final,     // Final Round
    colors.rejected,  // Rejected at Final
    colors.offers     // Offers
  ];

  const links = [
    // From Total Applications
    { 
      source: 0, 
      target: 1, 
      value: noResponse, 
      stroke: colors.rejected, 
      strokeOpacity: 0.6 
    },
    { 
      source: 0, 
      target: 2, 
      value: reachedHR.length, 
      stroke: colors.hrScreen, 
      strokeOpacity: 0.7 
    },
    
    // From HR Screen
    { 
      source: 2, 
      target: 3, 
      value: rejectedAtHR, 
      stroke: colors.rejected, 
      strokeOpacity: 0.6 
    },
    { 
      source: 2, 
      target: 4, 
      value: reachedTechnical.length, 
      stroke: colors.technical, 
      strokeOpacity: 0.7 
    },
    
    // From Technical Round
    { 
      source: 4, 
      target: 5, 
      value: rejectedAtTechnical, 
      stroke: colors.rejected, 
      strokeOpacity: 0.6 
    },
    { 
      source: 4, 
      target: 6, 
      value: reachedFinal.length, 
      stroke: colors.final, 
      strokeOpacity: 0.7 
    },
    
    // From Final Round
    { 
      source: 6, 
      target: 7, 
      value: rejectedAtFinal, 
      stroke: colors.rejected, 
      strokeOpacity: 0.6 
    },
    { 
      source: 6, 
      target: 8, 
      value: offers.length, 
      stroke: colors.offers, 
      strokeOpacity: 0.8 
    }
  ].filter(link => link.value > 0);

  return { nodes, links, nodeColors };
}

// Calculate conversion rates for insights
function calculateConversionRates(applications: Application[]) {
  const total = applications.length;
  if (total === 0) return {};

  const reachedHR = applications.filter(app => {
    const stage = app.applicationStage;
    return stage && !["No Callback", "In Review"].includes(stage);
  }).length;

  const reachedTechnical = applications.filter(app => {
    const stage = app.applicationStage;
    return stage && ["Hiring Manager Round", "Case Study/Assignment", "Panel Interview", "Final Round", "Offer"].includes(stage);
  }).length;

  const offers = applications.filter(app => 
    app.applicationStage === "Offer" || app.jobStatus === "Offer"
  ).length;

  return {
    hrRate: ((reachedHR / total) * 100).toFixed(1),
    technicalRate: reachedHR > 0 ? ((reachedTechnical / reachedHR) * 100).toFixed(1) : "0",
    offerRate: ((offers / total) * 100).toFixed(1)
  };
}

export default function ApplicationFunnelChart() {
  const [width, setWidth] = useState(700);

  const { data: applicationsData } = useQuery<{ totalCount: number; applications: Application[] }>({
    queryKey: ["/api/applications"],
    queryFn: async () => {
      const res = await fetch("/api/applications?limit=50000");
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });

  const applications = applicationsData?.applications || [];
  const totalCount = applicationsData?.totalCount || 0;
  const { nodes, links, nodeColors } = calculateSankeyData(applications);
  const conversionRates = calculateConversionRates(applications);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(Math.min(w - 100, 800));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Application Funnel</h3>
            <div className="text-sm text-slate-600">
              Showing {applications.length} of {totalCount} applications
            </div>
          </div>
          
          {/* Conversion Rate Summary */}
          <div className="text-right text-sm">
            <div className="text-slate-600">Key Conversion Rates:</div>
            <div className="space-y-1 mt-1">
              <div>HR Response: <span className="font-semibold text-blue-600">{conversionRates.hrRate}%</span></div>
              <div>HR → Technical: <span className="font-semibold text-indigo-600">{conversionRates.technicalRate}%</span></div>
              <div>Overall Offer Rate: <span className="font-semibold text-green-600">{conversionRates.offerRate}%</span></div>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.total }}></div>
            <span className="text-slate-600">Starting Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.hrScreen }}></div>
            <span className="text-slate-600">Progression</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.rejected }}></div>
            <span className="text-slate-600">Rejections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.offers }}></div>
            <span className="text-slate-600">Success</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Sankey
            width={width}
            height={600}
            data={{ nodes, links }}
            nodePadding={50}
            nodeWidth={15}
            linkCurvature={0.6}
            iterations={150}
            node={(props) => {
              const { payload, x, y, width: nodeWidth, height: nodeHeight } = props;
              const nodeIndex = nodes.findIndex(n => n.name === payload.name);
              const color = nodeColors[nodeIndex] || colors.total;
              
              return (
                <rect
                  x={x}
                  y={y}
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={color}
                  stroke="none"
                />
              );
            }}
          >
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
              formatter={(value, name) => [
                `${value} applications`,
                String(name || '').replace(/\n/g, ' ')
              ]}
            />
          </Sankey>
        </div>

        {/* Insights */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-2">Funnel Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-600">Most applications (No Response)</div>
              <div className="text-slate-800">Focus on application quality and targeting</div>
            </div>
            <div>
              <div className="text-slate-600">HR Screen Performance</div>
              <div className="text-slate-800">{conversionRates.hrRate}% of applications get HR response</div>
            </div>
            <div>
              <div className="text-slate-600">Technical Success Rate</div>
              <div className="text-slate-800">{conversionRates.technicalRate}% pass HR screening</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}