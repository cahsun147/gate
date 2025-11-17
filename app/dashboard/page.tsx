'use client';

import { Animator } from '@arwes/react';
import styled from '@emotion/styled';
import GateHeader from '@/components/GateHeader';

const ContentBox = styled.div`
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0.25rem;
`;

export default function DashboardPage() {
  return (
    <Animator>
      <GateHeader title="DASHBOARD" />
      <ContentBox style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#00ffff', margin: '0 0 1rem 0' }}>
          Selamat Datang di XGate
        </h1>
        <p style={{ color: '#ffffff', lineHeight: '1.6' }}>
          Pilih menu dari sidebar untuk melihat data. Proyek ini sekarang berjalan
          menggunakan Arwes UI versi 'next'.
        </p>
      </ContentBox>
    </Animator>
  );
}
