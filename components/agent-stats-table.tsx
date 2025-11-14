'use client';

import { FrameLines, Text } from '@arwes/react';
import styled from '@emotion/styled';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  thead {
    border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  }

  th {
    padding: 0.75rem;
    text-align: left;
    color: #00ffff;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.75rem;
    border-bottom: 1px solid rgba(0, 255, 255, 0.1);
    color: #ffffff;
  }

  tbody tr {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 255, 255, 0.05);
      border-left: 2px solid #00ffff;
    }
  }
`;

export function AgentStatsTable() {
  const stats = [
    {
      ecosystem: 'Custom',
      mindshare: '61.43%',
      change24h: '-3.1',
      marketCap: '$4.16B',
      echo: '78.4%',
      volume: '$143.93M',
    },
    {
      ecosystem: 'Solana',
      mindshare: '45.20%',
      change24h: '+2.5',
      marketCap: '$3.82B',
      echo: '72.1%',
      volume: '$128.45M',
    },
    {
      ecosystem: 'Base',
      mindshare: '32.15%',
      change24h: '-1.8',
      marketCap: '$2.91B',
      echo: '65.3%',
      volume: '$95.67M',
    },
  ];

  return (
    <FrameLines as="div" animator padding={2}>
      <Text as="h2" animator style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>
        Agent Statistics
      </Text>
      <StyledTable>
        <thead>
          <tr>
            <th>Ecosystem name</th>
            <th>Mindshare</th>
            <th>Δ24H</th>
            <th>Market cap</th>
            <th>Echo</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, index) => (
            <tr key={index}>
              <td>{stat.ecosystem}</td>
              <td>{stat.mindshare}</td>
              <td style={{ color: stat.change24h.startsWith('-') ? '#ff0000' : '#00ff00', fontWeight: 'bold' }}>
                {stat.change24h}
              </td>
              <td>{stat.marketCap}</td>
              <td>{stat.echo}</td>
              <td>{stat.volume}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </FrameLines>
  );
}