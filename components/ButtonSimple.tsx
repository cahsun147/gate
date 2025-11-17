'use client';

import React, { type HTMLProps, type ReactNode } from 'react';
import { 
    Animated, 
    FrameCorners,
    useBleeps
} from '@arwes/react';
import styled from '@emotion/styled';

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

const FrameCornerStyled = styled(FrameCorners)`
  opacity: 0.3;
  transition: opacity 0.2s ease-out;
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.3));

  &:hover {
    opacity: 0.7;
  }
`;

const ButtonSimple = React.forwardRef<HTMLButtonElement, ButtonSimpleProps>(
  ({ className, animated, children, as: Component = 'button', ...otherProps }, ref) => {
    const bleeps = useBleeps();

    const handleMouseEnter = () => {
      bleeps?.click?.play();
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
          background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 200, 255, 0.05) 100%)',
          border: '2px solid hsl(180, 75%, 50%)',
          color: 'hsl(180, 100%, 70%)',
          fontFamily: 'var(--font-tomorrow), sans-serif',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'none',
          borderRadius: '4px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          ...((otherProps as any).style || {})
        }}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        animated={animated}
      >
        <FrameCorners
          style={{
            position: 'absolute',
            inset: 0,
            // @ts-expect-error css variables
            '--arwes-frames-bg-color': 'transparent',
            '--arwes-frames-line-color': 'currentcolor',
            '--arwes-frames-deco-color': 'currentcolor'
          }}
          animated={false}
        />
        <ButtonContent>
          {children}
        </ButtonContent>
      </Animated>
    );
  }
);

ButtonSimple.displayName = 'ButtonSimple';

export { ButtonSimple };
