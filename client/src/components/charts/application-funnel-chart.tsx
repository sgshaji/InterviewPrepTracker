import { useQuery } from "@tanstack/react-query";
import { Application } from "@shared/schema";

// Simple Sankey-style flow chart using CSS
export default function ApplicationFunnelChart() {
  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  if (!applications || applications.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Application Funnel</h3>
        <p className="text-gray-500">No application data available</p>
      </div>
    );
  }

  // Calculate funnel data from real applications
  const totalApplications = applications.length;
  const stageData = applications.reduce((acc, app) => {
    const stage = app.applicationStage;
    const status = app.jobStatus;
    
    acc[stage] = (acc[stage] || 0) + 1;
    acc[`${stage}_${status}`] = (acc[`${stage}_${status}`] || 0) + 1;
    
    return acc;
  }, {} as Record<string, number>);

  // Define the funnel flow stages
  const stages = [
    { key: "In Review", label: "In Review", color: "bg-blue-500" },
    { key: "HR Round", label: "HR Round", color: "bg-green-500" },
    { key: "HM Round", label: "HM Round", color: "bg-yellow-500" },
    { key: "Case Study", label: "Case Study", color: "bg-purple-500" },
    { key: "Panel", label: "Panel", color: "bg-orange-500" },
    { key: "Offer", label: "Offer", color: "bg-emerald-500" },
    { key: "Rejected", label: "Rejected", color: "bg-red-500" }
  ];

  // Calculate percentages for visualization
  const getStageWidth = (stage: string) => {
    const count = stageData[stage] || 0;
    if (totalApplications === 0) return 0;
    return Math.max((count / totalApplications) * 100, 2); // Minimum 2% for visibility
  };

  const getStageCount = (stage: string) => stageData[stage] || 0;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Application Funnel ({totalApplications} total)
      </h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const count = getStageCount(stage.key);
          const width = getStageWidth(stage.key);
          const percentage = totalApplications > 0 ? ((count / totalApplications) * 100).toFixed(1) : '0';
          
          if (count === 0) return null;

          return (
            <div key={stage.key} className="relative">
              {/* Stage label and stats */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stage.label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {count} ({percentage}%)
                </span>
              </div>
              
              {/* Flow bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                  <div 
                    className={`h-8 ${stage.color} rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium`}
                    style={{ width: `${width}%` }}
                  >
                    {count > 0 && <span>{count}</span>}
                  </div>
                </div>
                
                {/* Connection line to next stage */}
                {index < stages.length - 1 && count > 0 && (
                  <div className="absolute left-1/2 top-8 w-0.5 h-4 bg-gray-300 dark:bg-gray-600 transform -translate-x-1/2"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Success rate summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {getStageCount("In Review")}
            </div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {getStageCount("Offer")}
            </div>
            <div className="text-xs text-gray-500">Offers</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {getStageCount("Rejected")}
            </div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
}