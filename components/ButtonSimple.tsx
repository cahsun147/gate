'use client';

import React, { type HTMLProps, type ReactNode } from 'react';
import { 
  Animated, 
  FrameCorners,
  Illuminator,
  useBleeps
} from '@arwes/react';
import styled from '@emotion/styled';
import { type BleepNames } from '@/config/bleeps';

interface ButtonSimpleProps extends Omit<HTMLProps<HTMLButtonElement>, 'as'> {
  className?: string;
  animated?: any;
  children: ReactNode;
  as?: React.ElementType;
}

const ButtonContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  flex: 1;
  user-select: none;
  z-index: 1;

  svg {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 0.625rem 1.25rem;
    gap: 0.5rem;

    svg {
      font-size: 1rem;
    }
  }
`;

const ButtonSimple = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonSimpleProps>(
    ({ className, animated, children, as: Component = 'button', ...otherProps }, ref) => {
      const bleeps = useBleeps<BleepNames>();

      const handleMouseEnter = () => {
        bleeps?.hover?.play();
      };

      const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (otherProps.onClick) {
          otherProps.onClick(event as any);
        }
        bleeps?.click?.play();
      };

      return (
        <Animated
          ref={ref}
          as={Component as any}
          {...(otherProps as any)}
          className={className}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(180, 100%, 70%)',
            fontFamily: 'var(--font-tomorrow), sans-serif',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'color 0.2s ease-out',
            overflow: 'hidden',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            userSelect: 'none',
            background: 'transparent',
            border: 'none',
            padding: 0,
            ...((otherProps as any).style || {})
          }}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          animated={animated}
        >
          <FrameCorners
            className="group"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.3,
              transition: 'opacity 0.2s ease-out',
              filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.3))',
              // @ts-expect-error css variables
              '--arwes-frames-bg-color': 'transparent',
              '--arwes-frames-line-color': 'currentcolor',
              '--arwes-frames-deco-color': 'currentcolor'
            }}
            animated={false}
          />
          <Illuminator
            style={{
              position: 'absolute',
              inset: '4px',
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)',
              opacity: 0.2,
              transition: 'opacity 0.2s ease-out'
            }}
            size={60}
            color="hsl(180, 100%, 70%)"
          />
          <ButtonContent>
            {children}
          </ButtonContent>
        </Animated>
      );
    }
  )
);

ButtonSimple.displayName = 'ButtonSimple';

export { ButtonSimple };
