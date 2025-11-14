'use client';

import Image from 'next/image';
import { FrameLines, Text } from '@arwes/react';
import styled from '@emotion/styled';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const AgentCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
`;

export function TopAgentsGrid() {
  const agents = [
    {
      name: 'AVA',
      image: '/agents/ava.png',
      value: '4.22%',
      change: '+2.2',
      current: '4.22%',
    },
    {
      name: 'BUDDY',
      image: '/agents/buddy.png',
      value: '2.75%',
      change: '+2.03',
      current: '2.75%',
    },
    {
      name: 'ECHO',
      image: '/agents/echo.png',
      value: '2.15%',
      change: '+1.85',
      current: '2.15%',
    },
    {
      name: 'NEXUS',
      image: '/agents/nexus.png',
      value: '1.95%',
      change: '+1.65',
      current: '1.95%',
    },
  ];

  return (
    <GridContainer>
      {agents.map((agent, index) => (
        <FrameLines key={index} as="div" animator padding={1}>
          <AgentCard>
            <Image
              src={agent.image}
              alt={agent.name}
              width={40}
              height={40}
              style={{ borderRadius: '50%' }}
            />
            <Text as="div" animator style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#00ffff' }}>
              {agent.name}
            </Text>
            <Text as="div" animator style={{ fontSize: '0.75rem', color: '#00aaaa' }}>
              {agent.current}
            </Text>
            <Text as="div" animator style={{ fontSize: '0.75rem', color: '#00ff00' }}>
              {agent.change}
            </Text>
          </AgentCard>
        </FrameLines>
      ))}
    </GridContainer>
  );
}