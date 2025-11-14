import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AgentDominanceChart() {
  const data = [
    { name: '00:00', solana: 2.56, base: 2.44, other: 1.95 },
    // Add more data points...
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip />
        <Line type="monotone" dataKey="solana" stroke="#8884d8" />
        <Line type="monotone" dataKey="base" stroke="#82ca9d" />
        <Line type="monotone" dataKey="other" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
} 