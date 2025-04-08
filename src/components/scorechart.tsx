// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// interface ScoreChartProps {
//   data: Array<{
//     date: string;
//     score: number;
//   }>;
//   maxScore: number;
//   color: string;
//   title: string;
//   timeFilter: 'weekly' | 'monthly' | 'yearly';
//   onTimeFilterChange: (filter: 'weekly' | 'monthly' | 'yearly') => void;
// }

// const ScoreChart: React.FC<ScoreChartProps> = ({ 
//   data, 
//   maxScore, 
//   color, 
//   title,
//   timeFilter,
//   onTimeFilterChange 
// }) => {
//   return (
//     <Card className="p-4 mt-2">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-semibold">{title} Score History</h3>
//         <div className="flex gap-2">
//           <Button 
//             variant={timeFilter === 'weekly' ? 'default' : 'outline'}
//             onClick={() => onTimeFilterChange('weekly')}
//             size="sm"
//           >
//             Weekly
//           </Button>
//           <Button 
//             variant={timeFilter === 'monthly' ? 'default' : 'outline'}
//             onClick={() => onTimeFilterChange('monthly')}
//             size="sm"
//           >
//             Monthly
//           </Button>
//           <Button 
//             variant={timeFilter === 'yearly' ? 'default' : 'outline'}
//             onClick={() => onTimeFilterChange('yearly')}
//             size="sm"
//           >
//             Yearly
//           </Button>
//         </div>
//       </div>

//       <div className="h-[300px] w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis 
//               dataKey="date"
//               angle={-45}
//               textAnchor="end"
//               height={60}
//             />
//             <YAxis domain={[0, maxScore]} />
//             <Tooltip />
//             <Legend />
//             <Line 
//               type="monotone" 
//               dataKey="score" 
//               stroke={color}
//               name={`${title} Score`}
//               dot={{ r: 4 }}
//               activeDot={{ r: 8 }}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
//   );
// };

// export default ScoreChart;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ScoreChartProps {
  data: Array<{
    date: string;
    score: number;
  }>;
  maxScore: number;
  color: string;
  title: string;
  timeFilter: 'weekly' | 'monthly' | 'yearly';
  onTimeFilterChange: (filter: 'weekly' | 'monthly' | 'yearly') => void;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ 
  data, 
  maxScore, 
  color, 
  title,
  timeFilter,
  onTimeFilterChange 
}) => {
  // Calculate severity ranges based on title
  const getSeverityRanges = () => {
    if (title === 'PHQ-9') {
      return [
        { score: 4, label: 'Minimal', color: '#4ade80' },
        { score: 9, label: 'Mild', color: '#facc15' },
        { score: 14, label: 'Moderate', color: '#fb923c' },
        { score: 19, label: 'Moderately Severe', color: '#f87171' },
        { score: maxScore, label: 'Severe', color: '#ef4444' }
      ];
    } else {
      return [
        { score: 4, label: 'Minimal', color: '#4ade80' },
        { score: 9, label: 'Mild', color: '#facc15' },
        { score: 14, label: 'Moderate', color: '#fb923c' },
        { score: maxScore, label: 'Severe', color: '#ef4444' }
      ];
    }
  };

  const severityRanges = getSeverityRanges();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const severity = severityRanges.find((range, index) => 
        score <= range.score || index === severityRanges.length - 1
      );

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-sm">
            Score: <span className="font-medium">{score}</span>
          </p>
          <p className="text-sm">
            Severity: <span style={{ color: severity?.color }} className="font-medium">
              {severity?.label}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomizedDot = (props: any) => {
    const { cx, cy, value } = props;
    const severity = severityRanges.find((range, index) => 
      value <= range.score || index === severityRanges.length - 1
    );
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4}
        fill={severity?.color}
        stroke="white"
        strokeWidth={2}
      />
    );
  };

  return (
    <Card className="p-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title} Score History</h3>
          <div className="flex gap-2 mt-2">
            {severityRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: range.color }}
                />
                <span className="text-xs text-gray-600">{range.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeFilter === 'weekly' ? 'default' : 'outline'}
            onClick={() => onTimeFilterChange('weekly')}
            size="sm"
          >
            Weekly
          </Button>
          <Button 
            variant={timeFilter === 'monthly' ? 'default' : 'outline'}
            onClick={() => onTimeFilterChange('monthly')}
            size="sm"
          >
            Monthly
          </Button>
          <Button 
            variant={timeFilter === 'yearly' ? 'default' : 'outline'}
            onClick={() => onTimeFilterChange('yearly')}
            size="sm"
          >
            Yearly
          </Button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              domain={[0, maxScore]}
              ticks={Array.from({ length: maxScore + 1 }, (_, i) => i)}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            {severityRanges.map((range, index) => (
              <ReferenceLine 
                key={index}
                y={range.score}
                stroke={range.color}
                strokeDasharray="3 3"
                opacity={0.5}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotoneX"
              dataKey="score" 
              stroke={color}
              name={`${title} Score`}
              strokeWidth={2}
              dot={<CustomizedDot />}
              activeDot={{ r: 8, fill: color }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No {title} score history available
        </div>
      )}
    </Card>
  );
};

export default ScoreChart;