'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Animator, FrameLines, Text } from '@arwes/react';
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
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  gap: 1rem;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  overflow-y: auto;
`;

const CardPlaceholder = styled.div`
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0.25rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 255, 255, 0.5);
`;

export default function Page() {
  return (
    <Animator>
      <MainContainer>
        <AppSidebar />
        <ContentArea>
          <Header>
            <Text as="h1" animator style={{ fontSize: '1.5rem', color: '#00ffff', margin: 0 }}>
              Dashboard
            </Text>
          </Header>

          <ContentContainer>
            <FrameLines as="div" animator padding={2}>
              <Text as="h2" animator style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>
                Metric 1
              </Text>
              <CardPlaceholder>Coming Soon</CardPlaceholder>
            </FrameLines>

            <FrameLines as="div" animator padding={2}>
              <Text as="h2" animator style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>
                Metric 2
              </Text>
              <CardPlaceholder>Coming Soon</CardPlaceholder>
            </FrameLines>

            <FrameLines as="div" animator padding={2}>
              <Text as="h2" animator style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>
                Metric 3
              </Text>
              <CardPlaceholder>Coming Soon</CardPlaceholder>
            </FrameLines>

            <FrameLines as="div" animator padding={2} style={{ gridColumn: '1 / -1' }}>
              <Text as="h2" animator style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>
                Full Width Section
              </Text>
              <CardPlaceholder style={{ minHeight: '400px' }}>Coming Soon</CardPlaceholder>
            </FrameLines>
          </ContentContainer>
        </ContentArea>
      </MainContainer>
    </Animator>
  );
}
