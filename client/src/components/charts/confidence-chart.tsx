import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

export default function ConfidenceChart() {
  const { data: confidenceTrends, isLoading } = useQuery<{ topic: string; score: number }[]>({
    queryKey: ["/api/dashboard/confidence-trends"],
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Confidence Trends</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">1-5 Scale</span>
            </div>
          </div>
          <div className="h-64 animate-pulse bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = confidenceTrends?.map(item => ({
    topic: item.topic.replace(' Thinking', '').replace('Product ', ''),
    score: item.score
  })) || [];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Confidence Trends</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">1-5 Scale</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                dataKey="topic"
              />
              <PolarRadiusAxis 
                angle={90}
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickCount={6}
              />
              <Radar
                name="Confidence"
                dataKey="score"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
