import { useQuery } from "@tanstack/react-query";
import { PreparationSession } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

export default function PreparationProgressChart() {
  const { data: sessions } = useQuery<PreparationSession[]>({
    queryKey: ["/api/preparation-sessions"],
  });

  // Process data for last 4 weeks
  const processWeeklyData = () => {
    if (!sessions) return [];

    const weeks = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(today, i * 7), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const avgConfidence = weekSessions.length > 0
        ? weekSessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / weekSessions.length
        : 0;

      const uniqueDays = new Set(weekSessions.map(s => format(new Date(s.date), 'yyyy-MM-dd'))).size;

      weeks.push({
        week: format(weekStart, 'MMM dd'),
        sessions: weekSessions.length,
        avgConfidence: Number(avgConfidence.toFixed(1)),
        activeDays: uniqueDays,
        color: avgConfidence >= 4 ? '#22c55e' : avgConfidence >= 3 ? '#eab308' : '#ef4444'
      });
    }

    return weeks;
  };

  const weeklyData = processWeeklyData();

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Preparation Progress</h3>
          <p className="text-sm text-slate-600">Weekly confidence & activity trends</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              domain={[0, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: any, name: string) => [
                name === 'avgConfidence' ? `${value}/5` : value,
                name === 'avgConfidence' ? 'Avg Confidence' : name === 'sessions' ? 'Total Sessions' : 'Active Days'
              ]}
            />
            <Bar dataKey="avgConfidence" name="avgConfidence" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {weeklyData[weeklyData.length - 1]?.avgConfidence || 0}/5
          </div>
          <div className="text-xs text-slate-500">This Week Avg</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {weeklyData[weeklyData.length - 1]?.sessions || 0}
          </div>
          <div className="text-xs text-slate-500">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {weeklyData[weeklyData.length - 1]?.activeDays || 0}/7
          </div>
          <div className="text-xs text-slate-500">Active Days</div>
        </div>
      </div>
    </div>
  );
}