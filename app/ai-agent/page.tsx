'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AgentMetricsCard } from '@/components/agent-metrics-card';
import { AgentDominanceChart } from '@/components/agent-dominance-chart';
import { TopAgentsGrid } from '@/components/top-agents-grid';
import { AgentStatsTable } from '@/components/agent-stats-table';
import { Animator, FrameLines, Text, Button } from '@arwes/react';
import { Search } from 'lucide-react';
import styled from '@emotion/styled';

const MainContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background: #000;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(0, 20, 40, 0.5) 0%, rgba(0, 10, 20, 0.5) 100%);
  border-left: 1px solid rgba(0, 255, 255, 0.1);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  gap: 1rem;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  overflow-x: auto;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => (props.active ? 'rgba(0, 255, 255, 0.1)' : 'transparent')};
  border: 1px solid ${props => (props.active ? '#00ffff' : 'rgba(0, 255, 255, 0.2)')};
  color: ${props => (props.active ? '#00ffff' : '#ffffff')};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;

  &:hover {
    border-color: #00ffff;
    color: #00ffff;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0.25rem;
  margin: 1.5rem;
  margin-bottom: 0;

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #ffffff;
    outline: none;
    font-size: 0.875rem;

    &::placeholder {
      color: rgba(0, 255, 255, 0.5);
    }
  }
`;

const GridSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export default function AIAgentIndex() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <Animator>
      <MainContainer>
        <AppSidebar />
        <ContentArea>
          <Header>
            <Text as="h1" animator style={{ fontSize: '1.25rem', color: '#00ffff', margin: 0 }}>
              1477 agents tracked
            </Text>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button animator style={{ fontSize: '0.875rem' }}>
                See Cookie DeFAI Hackathon Projects
              </Button>
              <Button animator style={{ fontSize: '0.875rem' }}>
                Trade
              </Button>
            </div>
          </Header>

          <TabsContainer>
            {['all', 'agents', 'infra', 'defai'].map((tab) => (
              <TabButton
                key={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabButton>
            ))}
          </TabsContainer>

          <SearchContainer>
            <Search size={18} style={{ color: '#00ffff' }} />
            <input placeholder="Search AI Agents or infrastructure" />
          </SearchContainer>

          <ContentContainer>
            <GridSection>
              <AgentMetricsCard
                title="Total market cap"
                value="6.49B"
                change="-3.52%"
                period="24H"
                chartData={[65, 59, 80, 81, 56, 55, 40]}
                borderColor="#ff4444"
                backgroundColor="rgba(255, 68, 68, 0.1)"
              />
              <AgentMetricsCard
                title="Smart Engagement"
                value="7.09K"
                change="-3.48%"
                period="24H"
                chartData={[28, 48, 40, 19, 86, 27, 90]}
                borderColor="#4CAF50"
                backgroundColor="rgba(76, 175, 80, 0.1)"
              />
            </GridSection>

            <FrameLines as="div" animator padding={2}>
              <Text as="h2" animator style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>
                Top 10 AI Agents by Mindshare (last 24h)
              </Text>
              <TopAgentsGrid />
            </FrameLines>
          </ContentContainer>

          <div style={{ padding: '1.5rem' }}>
            <AgentDominanceChart />
          </div>

          <div style={{ padding: '1.5rem' }}>
            <AgentStatsTable />
          </div>
        </ContentArea>
      </MainContainer>
    </Animator>
  );
}