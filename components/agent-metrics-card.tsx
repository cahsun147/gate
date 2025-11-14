"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LineChart } from "@/components/ui/line-chart";

interface AgentMetricsCardProps {
  title: string;
  value: string;
  change: string;
  period: string;
  chartData?: number[];
  borderColor?: string;
  backgroundColor?: string;
}

export function AgentMetricsCard({ 
  title, 
  value, 
  change, 
  period,
  chartData,
  borderColor,
  backgroundColor
}: AgentMetricsCardProps) {
  const isNegative = change.startsWith('-');
  
  return (
    <Card className="bg-black/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-2">
          <span className={cn(
            "text-sm",
            isNegative ? "text-red-500" : "text-green-500"
          )}>
            {change}
          </span>
          <span className="text-gray-500 text-sm ml-2">{period}</span>
        </div>
        {chartData && (
          <div className="mt-4 h-24">
            <LineChart 
              data={chartData}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 