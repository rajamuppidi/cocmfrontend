import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps 
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AssessmentData {
  assessmentDate: string;
  formattedDate: string;
  phq9: number | null;
  gad7: number | null;
}

interface ClinicalMeasuresChartProps {
  patientId: number | string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const ClinicalMeasuresChart: React.FC<ClinicalMeasuresChartProps> = ({ patientId }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (expanded) {
      fetchAssessmentData();
    }
  }, [expanded, timeFilter, patientId]);

  const fetchAssessmentData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4353/api/patients/${patientId}/assessment-history?timeframe=${timeFilter}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch assessment data');
      }
      const data: AssessmentData[] = await response.json();
      setAssessmentData(data);
    } catch (error) {
      console.error('Error fetching assessment data:', error);
    }
    setLoading(false);
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide Charts' : 'Show Charts'}
        </Button>
        
        {expanded && (
          <div className="flex gap-2">
            <Button 
              variant={timeFilter === 'weekly' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('weekly')}
            >
              Weekly
            </Button>
            <Button 
              variant={timeFilter === 'monthly' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('monthly')}
            >
              Monthly
            </Button>
            <Button 
              variant={timeFilter === 'yearly' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('yearly')}
            >
              Yearly
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Score Trends</h3>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                Loading data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={assessmentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="phq9"
                    domain={[0, 27]}
                    label={{ 
                      value: 'PHQ-9 Score', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <YAxis 
                    yAxisId="gad7"
                    orientation="right"
                    domain={[0, 21]}
                    label={{ 
                      value: 'GAD-7 Score', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    yAxisId="phq9"
                    type="monotone" 
                    dataKey="phq9" 
                    stroke="#2563eb" 
                    name="PHQ-9"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line 
                    yAxisId="gad7"
                    type="monotone" 
                    dataKey="gad7" 
                    stroke="#16a34a" 
                    name="GAD-7"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClinicalMeasuresChart;