'use client';

import React from 'react';
import Link from 'next/link';
import { Animator, Animated, BleepsOnAnimator } from '@arwes/react';
import { HiOutlineArrowRight, HiOutlineChartBar, HiOutlineSparkles, HiOutlineFire } from 'react-icons/hi2';
import styled from '@emotion/styled';
import { ButtonSimple } from '@/components/ButtonSimple';

const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, hsl(180, 75%, 4%) 0%, hsl(180, 75%, 8%) 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    gap: 1.5rem;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-family: var(--font-tomorrow), sans-serif;
  font-weight: 700;
  color: hsl(180, 100%, 60%);
  text-align: center;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: hsl(180, 75%, 70%);
  text-align: center;
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
  font-family: var(--font-tomorrow), sans-serif;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonContainer = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
`;

const NavButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 200, 255, 0.05) 100%);
  border: 2px solid hsl(180, 75%, 50%);
  color: hsl(180, 100%, 70%);
  font-family: var(--font-tomorrow), sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 1px;
  text-transform: uppercase;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(0, 255, 255, 0.2);
    transition: left 0.3s ease;
    z-index: -1;
  }

  &:hover {
    border-color: hsl(180, 100%, 60%);
    color: hsl(180, 100%, 80%);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
    transform: translateY(-2px);

    &::before {
      left: 0;
    }

    svg {
      transform: translateX(4px);
    }
  }

  svg {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
  width: 100%;
  max-width: 1000px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 2rem;
  }
`;

const FeatureCard = styled.div`
  padding: 1.5rem;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.4);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 255, 255, 0.15);
  }

  svg {
    font-size: 2.5rem;
    color: hsl(180, 100%, 60%);
    margin-bottom: 0.75rem;
  }

  h3 {
    font-family: var(--font-tomorrow), sans-serif;
    font-size: 1.1rem;
    color: hsl(180, 100%, 70%);
    margin: 0.75rem 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 0.9rem;
    color: hsl(180, 75%, 70%);
    margin: 0;
    line-height: 1.5;
  }
`;

export default function HomePage() {
  return (
    <Animator combine manager="sequenceReverse">
      <BleepsOnAnimator transitions={{ entering: 'click' }} continuous />

      <MainContainer>
        <Animator>
          <Animated as="div" animated={[['y', 40, 0]]}>
            <Title>XGate</Title>
          </Animated>
        </Animator>

        <Animator>
          <Animated as="div" animated={[['y', 40, 0]]}>
            <Subtitle>
              Memantau dan menganalisis data cryptocurrency dengan antarmuka futuristik berbasis Arwes UI
            </Subtitle>
          </Animated>
        </Animator>

        <Animator>
          <Animated as="div" animated={[['y', 40, 0]]}>
            <ButtonContainer>
              <Link href="/dashboard">
                <ButtonSimple>
                  <HiOutlineChartBar />
                  Dashboard
                  <HiOutlineArrowRight />
                </ButtonSimple>
              </Link>

              <ButtonSimple as="a" href="https://github.com" target="_blank" rel="noopener noreferrer">
                <HiOutlineSparkles />
                GitHub
                <HiOutlineArrowRight />
              </ButtonSimple>

              <ButtonSimple as="a" href="https://docs.arwes.dev" target="_blank" rel="noopener noreferrer">
                <HiOutlineFire />
                Arwes Docs
                <HiOutlineArrowRight />
              </ButtonSimple>
            </ButtonContainer>
          </Animated>
        </Animator>

        <Animator>
          <Animated as="div" animated={[['y', 40, 0]]}>
            <FeatureGrid>
              <FeatureCard>
                <HiOutlineChartBar />
                <h3>Real-time Data</h3>
                <p>Pantau data cryptocurrency secara real-time dengan akurasi tinggi</p>
              </FeatureCard>

              <FeatureCard>
                <HiOutlineSparkles />
                <h3>Analitik Mendalam</h3>
                <p>Analisis mendalam tentang tren pasar dan pergerakan harga</p>
              </FeatureCard>

              <FeatureCard>
                <HiOutlineFire />
                <h3>Pump Fun Monitor</h3>
                <p>Pantau aktivitas Pump.fun dengan dashboard interaktif</p>
              </FeatureCard>
            </FeatureGrid>
          </Animated>
        </Animator>
      </MainContainer>
    </Animator>
  );
}