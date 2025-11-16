'use client';

import { Animator } from '@arwes/react';
import styled from '@emotion/styled';

const RefreshButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00ffff;
  color: #00ffff;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 255, 0.2);
  }
`;

const ContentBox = styled.div`
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0.25rem;
`;

export default function PumpFunPage() {
  return (
    <Animator>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ContentBox style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#00ffff', margin: 0 }}>Pump.fun Monitor</h1>
          <RefreshButton>Refresh Data</RefreshButton>
        </ContentBox>
        
        <ContentBox>
          <h2 style={{ fontSize: '1rem', color: '#00ffff', marginBottom: '1rem' }}>Data Table</h2>
          <p style={{ color: '#ffffff' }}>
            Tabel data akan muncul di sini. Ganti &lt;table&gt; HTML
            lama Anda (yang tanpa style) dan letakkan di sini.
          </p>
        </ContentBox>
      </div>
    </Animator>
  );
}
