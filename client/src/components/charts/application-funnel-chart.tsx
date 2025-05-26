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

  // Process your real application data - realistic flow
  const flowData = {
    "Applied": applications.length,
    "No Callback": applications.filter(app => app.applicationStage === "No Callback").length,
    "HR Round": applications.filter(app => app.applicationStage === "HR Round").length,
    "HM Round": applications.filter(app => app.applicationStage === "HM Round").length,
    "Panel": applications.filter(app => app.applicationStage === "Panel").length,
    "Offer": applications.filter(app => app.applicationStage === "Offer").length,
    "Rejected": applications.filter(app => app.applicationStage === "Rejected").length,
  };

  // Main progression stages (always show these)
  const mainStages = [
    { key: "Applied", count: flowData.Applied, color: "#3b82f6", type: "main" },
    { key: "HR Round", count: flowData["HR Round"], color: "#06b6d4", type: "main" },
    { key: "HM Round", count: flowData["HM Round"], color: "#10b981", type: "main" },
    { key: "Panel", count: flowData["Panel"], color: "#f59e0b", type: "main" },
    { key: "Offer", count: flowData["Offer"], color: "#22c55e", type: "main" }
  ];

  // No callback and rejection stages (separate)
  const noCallbackStage = { key: "No Callback", count: flowData["No Callback"], color: "#6b7280", type: "rejection" };
  const rejectionStage = { key: "Rejected", count: flowData["Rejected"], color: "#dc2626", type: "rejection" };

  const maxCount = Math.max(...mainStages.map(s => s.count), rejectionStage.count);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Application Flow - Sankey Diagram ({applications.length} total applications)
      </h3>

      <div className="relative w-full h-96 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 800 400" className="w-full h-full">
          {/* Draw main progression flows */}
          {mainStages.slice(0, -1).map((stage, index) => {
            const nextStage = mainStages[index + 1];
            if (!nextStage || nextStage.count === 0) return null;
            
            const startX = (index + 1) * 120;
            const endX = (index + 2) * 120;
            const startY = 120;
            const endY = 120;
            const flowValue = nextStage.count;
            const height = Math.max(8, (flowValue / maxCount) * 80);

            return (
              <g key={`main-flow-${index}`}>
                {/* Main progression flow */}
                <path
                  d={`M ${startX + 30} ${startY - height/2} 
                      C ${startX + 60} ${startY - height/2}, ${endX - 60} ${endY - height/2}, ${endX - 30} ${endY - height/2}
                      L ${endX - 30} ${endY + height/2}
                      C ${endX - 60} ${endY + height/2}, ${startX + 60} ${startY + height/2}, ${startX + 30} ${startY + height/2}
                      Z`}
                  fill={stage.color}
                  opacity="0.4"
                  stroke={stage.color}
                  strokeWidth="1"
                />
                {/* Flow value label */}
                <text
                  x={(startX + endX) / 2}
                  y={startY - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="#374151"
                  className="pointer-events-none"
                >
                  {flowValue}
                </text>
              </g>
            );
          })}

          {/* Draw No Callback flow from Applied */}
          {noCallbackStage.count > 0 && (
            <g>
              <path
                d={`M 135 150 
                    C 200 180, 500 220, 565 240
                    L 565 260
                    C 500 240, 200 200, 135 170
                    Z`}
                fill={noCallbackStage.color}
                opacity="0.4"
                stroke={noCallbackStage.color}
                strokeWidth="1"
              />
              <text
                x={350}
                y={210}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#374151"
                className="pointer-events-none"
              >
                {noCallbackStage.count}
              </text>
            </g>
          )}

          {/* Draw rejection flows from each stage */}
          {mainStages.map((stage, index) => {
            if (index === 0 || index === mainStages.length - 1) return null; // Skip Applied and Offer stages
            
            const stageX = (index + 1) * 120;
            const rejectionX = 650; // Fixed position for rejections
            const stageY = 120;
            const rejectionY = 320;
            
            // Calculate rejections at this stage (estimate based on drop-off)
            const currentCount = stage.count;
            const nextCount = index < mainStages.length - 1 ? mainStages[index + 1].count : 0;
            const rejectedAtStage = Math.max(0, currentCount - nextCount);
            
            if (rejectedAtStage === 0) return null;
            
            const height = Math.max(3, (rejectedAtStage / maxCount) * 30);

            return (
              <g key={`rejection-flow-${index}`}>
                {/* Rejection flow */}
                <path
                  d={`M ${stageX + 15} ${stageY + 30} 
                      C ${stageX + 50} ${stageY + 80}, ${rejectionX - 50} ${rejectionY - 30}, ${rejectionX - 15} ${rejectionY - height/2}
                      L ${rejectionX - 15} ${rejectionY + height/2}
                      C ${rejectionX - 50} ${rejectionY + 30}, ${stageX + 50} ${stageY + 100}, ${stageX + 15} ${stageY + 50}
                      Z`}
                  fill={rejectionStage.color}
                  opacity="0.3"
                  stroke={rejectionStage.color}
                  strokeWidth="1"
                />
                {/* Rejection count label */}
                <text
                  x={(stageX + rejectionX) / 2}
                  y={(stageY + rejectionY) / 2}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#666"
                  className="pointer-events-none"
                >
                  {rejectedAtStage}
                </text>
              </g>
            );
          })}

          {/* Draw main stage nodes */}
          {mainStages.map((stage, index) => {
            const x = (index + 1) * 120;
            const y = 120;
            const nodeHeight = Math.max(25, (stage.count / maxCount) * 80);
            const nodeWidth = 30;

            return (
              <g key={stage.key}>
                {/* Node rectangle */}
                <rect
                  x={x}
                  y={y - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={stage.color}
                  opacity="0.9"
                  rx="6"
                />
                
                {/* Stage label */}
                <text
                  x={x + nodeWidth / 2}
                  y={y - nodeHeight / 2 - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
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
                  fontSize="12"
                  fontWeight="700"
                  fill="white"
                  className="pointer-events-none"
                >
                  {stage.count}
                </text>
                
                {/* Percentage below node */}
                <text
                  x={x + nodeWidth / 2}
                  y={y + nodeHeight / 2 + 25}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="500"
                  fill="#6b7280"
                  className="pointer-events-none"
                >
                  {((stage.count / flowData.Applied) * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Draw No Callback node */}
          {noCallbackStage.count > 0 && (
            <g>
              <rect
                x={550}
                y={240}
                width={30}
                height={40}
                fill={noCallbackStage.color}
                opacity="0.9"
                rx="6"
              />
              <text
                x={565}
                y={230}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#374151"
                className="pointer-events-none"
              >
                No Callback
              </text>
              <text
                x={565}
                y={265}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="white"
                className="pointer-events-none"
              >
                {noCallbackStage.count}
              </text>
              <text
                x={565}
                y={295}
                textAnchor="middle"
                fontSize="10"
                fontWeight="500"
                fill="#6b7280"
                className="pointer-events-none"
              >
                {((noCallbackStage.count / flowData.Applied) * 100).toFixed(1)}%
              </text>
            </g>
          )}

          {/* Draw rejection node */}
          {rejectionStage.count > 0 && (
            <g>
              <rect
                x={635}
                y={300}
                width={30}
                height={40}
                fill={rejectionStage.color}
                opacity="0.9"
                rx="6"
              />
              <text
                x={650}
                y={290}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#374151"
                className="pointer-events-none"
              >
                {rejectionStage.key}
              </text>
              <text
                x={650}
                y={325}
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="white"
                className="pointer-events-none"
              >
                {rejectionStage.count}
              </text>
              <text
                x={650}
                y={355}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#6b7280"
                className="pointer-events-none"
              >
                {((rejectionStage.count / flowData.Applied) * 100).toFixed(1)}%
              </text>
            </g>
          )}
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
            <div className="text-lg font-semibold text-cyan-600">
              {flowData["HR Round"]}
            </div>
            <div className="text-xs text-gray-500">HR Round</div>
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