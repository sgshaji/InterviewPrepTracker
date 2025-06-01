import { Sankey, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

const mockNodes = [
  { name: 'Applied' },
  { name: 'Interview' },
  { name: 'Offer' },
  { name: 'Rejected' },
];

const mockLinks = [
  { source: 0, target: 1, value: 60 },
  { source: 1, target: 2, value: 10 },
  { source: 1, target: 3, value: 50 },
  { source: 0, target: 3, value: 40 },
];

export default function ApplicationFunnelChart() {
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(Math.min(w - 100, 700));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Funnel</h3>
        <div className="overflow-x-auto">
          <Sankey
            width={width}
            height={300}
            data={{ nodes: mockNodes, links: mockLinks }}
            nodePadding={20}
            nodeWidth={20}
            linkCurvature={0.5}
          >
            <Tooltip />
          </Sankey>
        </div>
      </CardContent>
    </Card>
  );
}
