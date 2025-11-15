'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  FaTerminal,
  FaRobot,
  FaBook,
  FaC,
  FaLifeRing,
  FaPaperPlane,
  FaChartPie,
  FaChevronDown,
} from 'react-icons/fa6';
import Image from 'next/image';
import { FrameLines, Animator } from '@arwes/react';
import styled from '@emotion/styled';

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  border-right: 1px solid rgba(0, 255, 255, 0.2);
  padding: 1rem;
  gap: 1rem;
  overflow-y: auto;
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled.a<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: ${props => props.isActive ? '#00ffff' : '#ffffff'};
  text-decoration: none;
  border-left: 2px solid ${props => props.isActive ? '#00ffff' : 'transparent'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #00ffff;
    border-left-color: #00ffff;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const data = {
  user: {
    name: 'XGate',
    email: '0x890..0999',
    avatar: 'https://github.com/shadcn.png',
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: 'terminal',
      isActive: true,
      items: [
        {
          title: 'Top Markets Meme',
          url: '/top-memecoin',
        },
        {
          title: 'Trending Pumpfun',
          url: '/pump-fun',
        },
        {
          title: 'Trending Ai-Agents',
          url: '/ai-agent',
        },
      ],
    },
    {
      title: 'Degen',
      url: '#',
      icon: 'robot',
      items: [
        {
          title: 'Pumpfun Tracker',
          url: '#',
        },
        {
          title: 'Moonshot Tracker',
          url: '#',
        },
        {
          title: 'Clanker Tracker',
          url: '#',
        },
        {
          title: 'Virtuals',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: 'book',
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: 'settings',
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: 'lifebuoy',
    },
    {
      title: 'Feedback',
      url: '#',
      icon: 'send',
    },
  ],
  projects: [
    {
      name: 'Pumpfun Bot',
      url: '#',
      icon: 'chart',
    },
    {
      name: 'Gate Data',
      url: '#',
      icon: 'pie',
    },
    {
      name: 'Gate Buy bot',
      url: '#',
      icon: 'robot',
    },
  ],
};

interface NavItemData {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

const getIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ size?: number }> } = {
    terminal: FaTerminal,
    robot: FaRobot,
    book: FaBook,
    settings: FaC,
    lifebuoy: FaLifeRing,
    send: FaPaperPlane,
    chart: FaChartPie,
    pie: FaChartPie,
  };
  return iconMap[iconName] || FaTerminal;
};

const NavMainComponent: React.FC<{ items: NavItemData[] }> = ({ items }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <NavSection>
      <div style={{ fontSize: '0.75rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Platform
      </div>
      {items.map((item) => {
        const Icon = getIcon(item.icon);
        const isExpanded = expandedItems.includes(item.title);
        return (
          <div key={item.title}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <NavItem href={item.url} isActive={item.isActive}>
                <Icon size={18} />
                <span>{item.title}</span>
              </NavItem>
              {item.items && item.items.length > 0 && (
                <button
                  onClick={() => toggleExpand(item.title)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00ffff',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <FaChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
              )}
            </div>
            {isExpanded && item.items && (
              <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {item.items.map((subItem) => (
                  <NavItem key={subItem.title} href={subItem.url} style={{ fontSize: '0.875rem', paddingLeft: '0.5rem' }}>
                    {subItem.title}
                  </NavItem>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </NavSection>
  );
};

const NavProjectsComponent: React.FC<{ projects: { name: string; url: string; icon: string }[] }> = ({ projects }) => {
  return (
    <NavSection>
      <div style={{ fontSize: '0.75rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Coming Soon
      </div>
      {projects.map((project) => {
        const Icon = getIcon(project.icon);
        return (
          <NavItem key={project.name} href={project.url}>
            <Icon size={18} />
            <span>{project.name}</span>
          </NavItem>
        );
      })}
    </NavSection>
  );
};

const NavSecondaryComponent: React.FC<{ items: { title: string; url: string; icon: string }[] }> = ({ items }) => {
  return (
    <NavSection>
      {items.map((item) => {
        const Icon = getIcon(item.icon);
        return (
          <NavItem key={item.title} href={item.url} style={{ fontSize: '0.875rem' }}>
            <Icon size={18} />
            <span>{item.title}</span>
          </NavItem>
        );
      })}
    </NavSection>
  );
};

export function AppSidebar() {
  return (
    <Animator>
      <SidebarContainer>
        <FrameLines padding={1} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image
              src="/favicon.ico"
              alt="Favicon"
              width={32}
              height={32}
              style={{ borderRadius: '0.5rem' }}
            />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#00ffff' }}>
                Gate bibbop
              </div>
              <div style={{ fontSize: '0.75rem', color: '#00aaaa' }}>
                Xdeployments
              </div>
            </div>
          </div>
        </FrameLines>

        <NavMainComponent items={data.navMain} />
        <NavProjectsComponent projects={data.projects} />
        <div style={{ marginTop: 'auto' }}>
          <NavSecondaryComponent items={data.navSecondary} />
        </div>

        <FrameLines padding={1} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image
              src={data.user.avatar}
              alt={data.user.name}
              width={32}
              height={32}
              style={{ borderRadius: '50%' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {data.user.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#00aaaa' }}>
                {data.user.email}
              </div>
            </div>
          </div>
        </FrameLines>
      </SidebarContainer>
    </Animator>
  );
}
