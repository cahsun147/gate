'use client';

import { FrameLines, Text } from '@arwes/react';
import styled from '@emotion/styled';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface AgentMetricsCardProps {
  title: string;
  value: string;
  change: string;
  period: string;
  chartData?: number[];
  borderColor?: string;
  backgroundColor?: string;
}

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Value = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #00ffff;
`;

const ChangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

export function AgentMetricsCard({
  title,
  value,
  change,
  period,
  chartData,
  borderColor,
  backgroundColor,
}: AgentMetricsCardProps) {
  const isNegative = change.startsWith('-');
  const chartDataFormatted = chartData?.map((val, idx) => ({ name: `${idx}`, value: val })) || [];

  return (
    <FrameLines as="div" animator padding={2}>
      <Text as="h3" animator style={{ fontSize: '0.875rem', color: '#00aaaa', marginBottom: '0.5rem' }}>
        {title}
      </Text>
      <CardContent>
        <ValueContainer>
          <Value>{value}</Value>
          <ChangeContainer>
            <span style={{ color: isNegative ? '#ff0000' : '#00ff00' }}>{change}</span>
            <span style={{ color: '#00aaaa' }}>{period}</span>
          </ChangeContainer>
        </ValueContainer>
        {chartData && chartData.length > 0 && (
          <div style={{ height: '100px', marginTop: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataFormatted}>
                <XAxis dataKey="name" stroke={borderColor || '#00ffff'} style={{ fontSize: '0.75rem' }} />
                <YAxis stroke={borderColor || '#00ffff'} style={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey="value" stroke={borderColor || '#00ffff'} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </FrameLines>
  );
}