import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function PrepTimeChart() {
  const { data: prepTime, isLoading } = useQuery<{ date: string; hours: number }[]>({
    queryKey: ["/api/dashboard/prep-time"],
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Weekly Preparation Time</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Hours</span>
            </div>
          </div>
          <div className="h-64 animate-pulse bg-slate-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = prepTime?.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: item.hours
  })) || [];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Weekly Preparation Time</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">Hours</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#2563EB" 
                strokeWidth={2}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
