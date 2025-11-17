'use client';

import React from 'react';
import { FrameHeader } from '@arwes/react-frames';
import styled from '@emotion/styled';

const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const HeaderTitle = styled.div`
  position: relative;
  color: #00ffff;
  font-family: 'Tomorrow', sans-serif;
  font-size: 2rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 2px;
  z-index: 1;
  padding: 0 2rem;
`;

const FrameHeaderStyled = styled(FrameHeader)`
  --arwes-frames-bg-color: hsl(180, 75%, 10%);
  --arwes-frames-line-color: hsl(180, 75%, 30%);
  --arwes-frames-deco-color: hsl(180, 75%, 50%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

interface GateHeaderProps {
  title?: string;
}

const GateHeader: React.FC<GateHeaderProps> = ({ title = 'GATE' }) => {
  return (
    <HeaderContainer>
      <FrameHeaderStyled contentLength={60} />
      <HeaderTitle>{title}</HeaderTitle>
    </HeaderContainer>
  );
};

export default GateHeader;
