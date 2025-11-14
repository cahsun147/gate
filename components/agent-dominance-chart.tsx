'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FrameLines } from '@arwes/react';

export function AgentDominanceChart() {
  const data = [
    { name: '00:00', solana: 2.56, base: 2.44, other: 1.95 },
    { name: '04:00', solana: 2.65, base: 2.50, other: 2.00 },
    { name: '08:00', solana: 2.70, base: 2.55, other: 2.05 },
    { name: '12:00', solana: 2.75, base: 2.60, other: 2.10 },
    { name: '16:00', solana: 2.80, base: 2.65, other: 2.15 },
    { name: '20:00', solana: 2.85, base: 2.70, other: 2.20 },
  ];

  return (
    <FrameLines as="div" animator padding={2}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#00ffff" style={{ fontSize: '0.75rem' }} />
          <YAxis stroke="#00ffff" style={{ fontSize: '0.75rem' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #00ffff',
              borderRadius: '0.25rem',
            }}
            labelStyle={{ color: '#00ffff' }}
          />
          <Line type="monotone" dataKey="solana" stroke="#00ffff" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="base" stroke="#00ff00" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="other" stroke="#ffaa00" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </FrameLines>
  );
}