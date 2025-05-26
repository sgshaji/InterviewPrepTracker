import { useQuery } from "@tanstack/react-query";
import { Application } from "@shared/schema";

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

  // Process your real application data
  const flowData = {
    "Applied": applications.length,
    "In Review": applications.filter(app => app.applicationStage === "In Review").length,
    "HR Round": applications.filter(app => app.applicationStage === "HR Round").length,
    "HM Round": applications.filter(app => app.applicationStage === "HM Round").length,
    "Case Study": applications.filter(app => app.applicationStage === "Case Study").length,
    "Panel": applications.filter(app => app.applicationStage === "Panel").length,
    "Offer": applications.filter(app => app.applicationStage === "Offer").length,
    "Rejected": applications.filter(app => app.applicationStage === "Rejected").length,
  };

  // Create flow stages that have data
  const stages = [
    { key: "Applied", count: flowData.Applied, color: "#3b82f6" },
    { key: "In Review", count: flowData["In Review"], color: "#8b5cf6" },
    { key: "HR Round", count: flowData["HR Round"], color: "#06b6d4" },
    { key: "HM Round", count: flowData["HM Round"], color: "#10b981" },
    { key: "Case Study", count: flowData["Case Study"], color: "#f59e0b" },
    { key: "Panel", count: flowData["Panel"], color: "#ef4444" },
    { key: "Offer", count: flowData["Offer"], color: "#22c55e" },
    { key: "Rejected", count: flowData["Rejected"], color: "#dc2626" }
  ].filter(stage => stage.count > 0);

  const maxCount = Math.max(...stages.map(s => s.count));

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Application Flow - Sankey Style ({applications.length} total applications)
      </h3>

      <div className="relative w-full h-96 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 800 300" className="w-full h-full">
          {/* Draw flowing connections between stages */}
          {stages.slice(0, -1).map((stage, index) => {
            const nextStage = stages[index + 1];
            if (!nextStage) return null;
            
            const startX = (index + 1) * 100;
            const endX = (index + 2) * 100;
            const startY = 150 - (stage.count / maxCount) * 60;
            const endY = 150 - (nextStage.count / maxCount) * 60;
            const height = Math.max(5, (Math.min(stage.count, nextStage.count) / maxCount) * 120);

            return (
              <g key={`flow-${index}`}>
                {/* Flowing path */}
                <path
                  d={`M ${startX + 30} ${startY} 
                      C ${startX + 60} ${startY}, ${endX - 60} ${endY}, ${endX - 30} ${endY}
                      L ${endX - 30} ${endY + height}
                      C ${endX - 60} ${endY + height}, ${startX + 60} ${startY + height}, ${startX + 30} ${startY + height}
                      Z`}
                  fill={stage.color}
                  opacity="0.3"
                  stroke={stage.color}
                  strokeWidth="1"
                />
                {/* Flow value label */}
                <text
                  x={(startX + endX) / 2}
                  y={startY + height / 2}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                  className="pointer-events-none"
                >
                  {Math.min(stage.count, nextStage.count)}
                </text>
              </g>
            );
          })}

          {/* Draw stage nodes */}
          {stages.map((stage, index) => {
            const x = (index + 1) * 100;
            const y = 150;
            const nodeHeight = Math.max(20, (stage.count / maxCount) * 120);
            const nodeWidth = 25;

            return (
              <g key={stage.key}>
                {/* Node rectangle */}
                <rect
                  x={x}
                  y={y - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={stage.color}
                  opacity="0.8"
                  rx="4"
                />
                
                {/* Stage label */}
                <text
                  x={x + nodeWidth / 2}
                  y={y - nodeHeight / 2 - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="500"
                  fill="#374151"
                  className="pointer-events-none"
                >
                  {stage.key}
                </text>
                
                {/* Count label */}
                <text
                  x={x + nodeWidth / 2}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="white"
                  className="pointer-events-none"
                >
                  {stage.count}
                </text>
                
                {/* Percentage below node */}
                <text
                  x={x + nodeWidth / 2}
                  y={y + nodeHeight / 2 + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  className="pointer-events-none"
                >
                  {((stage.count / flowData.Applied) * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {flowData.Applied}
            </div>
            <div className="text-xs text-gray-500">Total Applied</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-600">
              {flowData["In Review"]}
            </div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {flowData.Offer}
            </div>
            <div className="text-xs text-gray-500">Offers</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {flowData.Rejected}
            </div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
}