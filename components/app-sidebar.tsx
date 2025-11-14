'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  BookOpen,
  Bot,
  Frame,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { FrameLines, Button, Text, Animator } from '@arwes/react';
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
      icon: SquareTerminal,
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
      icon: Bot,
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
      icon: BookOpen,
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
      icon: Settings2,
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
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  projects: [
    {
      name: 'Pumpfun Bot',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Gate Data',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Gate Buy bot',
      url: '#',
      icon: Bot,
    },
  ],
};

interface NavItemData {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number }>;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

const NavMainComponent: React.FC<{ items: NavItemData[] }> = ({ items }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  return (
    <NavSection>
      <Text as="div" animator style={{ fontSize: '0.75rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Platform
      </Text>
      {items.map((item) => {
        const Icon = item.icon;
        const isExpanded = expandedItems.includes(item.title);
        return (
          <div key={item.title}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <NavItem as="a" href={item.url} isActive={item.isActive} animator>
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
                  <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
              )}
            </div>
            {isExpanded && item.items && (
              <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {item.items.map((subItem) => (
                  <NavItem key={subItem.title} as="a" href={subItem.url} animator style={{ fontSize: '0.875rem', paddingLeft: '0.5rem' }}>
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

const NavProjectsComponent: React.FC<{ projects: { name: string; url: string; icon: React.ComponentType<{ size?: number }> }[] }> = ({ projects }) => {
  return (
    <NavSection>
      <Text as="div" animator style={{ fontSize: '0.75rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Coming Soon
      </Text>
      {projects.map((project) => {
        const Icon = project.icon;
        return (
          <NavItem key={project.name} as="a" href={project.url} animator>
            <Icon size={18} />
            <span>{project.name}</span>
          </NavItem>
        );
      })}
    </NavSection>
  );
};

const NavSecondaryComponent: React.FC<{ items: { title: string; url: string; icon: React.ComponentType<{ size?: number }> }[] }> = ({ items }) => {
  return (
    <NavSection>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavItem key={item.title} as="a" href={item.url} animator style={{ fontSize: '0.875rem' }}>
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
        <FrameLines as="div" animator padding={1} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image
              src="/favicon.ico"
              alt="Favicon"
              width={32}
              height={32}
              style={{ borderRadius: '0.5rem' }}
            />
            <div>
              <Text as="div" animator style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#00ffff' }}>
                Gate bibbop
              </Text>
              <Text as="div" animator style={{ fontSize: '0.75rem', color: '#00aaaa' }}>
                Xdeployments
              </Text>
            </div>
          </div>
        </FrameLines>

        <NavMainComponent items={data.navMain} />
        <NavProjectsComponent projects={data.projects} />
        <div style={{ marginTop: 'auto' }}>
          <NavSecondaryComponent items={data.navSecondary} />
        </div>

        <FrameLines as="div" animator padding={1} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Image
              src={data.user.avatar}
              alt={data.user.name}
              width={32}
              height={32}
              style={{ borderRadius: '50%' }}
            />
            <div style={{ flex: 1 }}>
              <Text as="div" animator style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {data.user.name}
              </Text>
              <Text as="div" animator style={{ fontSize: '0.75rem', color: '#00aaaa' }}>
                {data.user.email}
              </Text>
            </div>
          </div>
        </FrameLines>
      </SidebarContainer>
    </Animator>
  );
}
