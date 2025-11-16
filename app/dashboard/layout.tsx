'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Animator } from '@arwes/react';
import { HiOutlineChartPie, HiOutlineFire, HiOutlineSparkles } from 'react-icons/hi2';
import styled from '@emotion/styled';

// Daftar navigasi kita
const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: HiOutlineChartPie },
  { name: 'Pump Fun', href: '/dashboard/pump-fun', icon: HiOutlineFire },
  { name: 'Top Memecoin', href: '/dashboard/top-memecoin', icon: HiOutlineSparkles }
];

const NavButton = styled.a<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => (props.isActive ? 'rgba(0, 255, 255, 0.1)' : 'transparent')};
  border: 1px solid ${props => (props.isActive ? '#00ffff' : 'rgba(0, 255, 255, 0.2)')};
  color: ${props => (props.isActive ? '#00ffff' : '#ffffff')};
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border-radius: 0.25rem;

  &:hover {
    border-color: #00ffff;
    color: #00ffff;
    background: rgba(0, 255, 255, 0.05);
  }
`;

const SidebarContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SidebarBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0.25rem;
`;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Animator>
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '1rem',
        padding: '1rem',
      }}>

        {/* === SIDEBAR === */}
        <SidebarBox>
          <h2 style={{ margin: 0, color: '#00ffff', fontSize: '1.25rem', paddingBottom: '0.5rem' }}>XGate</h2>
          <SidebarContainer>
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.name} href={link.href}>
                  <NavButton as="div" isActive={isActive}>
                    <Icon size={18} />
                    {link.name}
                  </NavButton>
                </Link>
              );
            })}
          </SidebarContainer>
        </SidebarBox>

        {/* === KONTEN UTAMA === */}
        <main style={{ overflowY: 'auto' }}>
          {children}
        </main>

      </div>
    </Animator>
  );
}
