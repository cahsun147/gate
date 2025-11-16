'use client';

import React, { type ReactElement, useState, useEffect } from 'react';
import { Animator } from '@arwes/react-animator';
import { Dots } from '@arwes/react-bgs';

export const ArwesBackground = (): ReactElement => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const iid = setInterval(() => setActive((active) => !active), 3_000);
    return () => clearInterval(iid);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <Animator active={active} duration={{ enter: 2, exit: 2 }}>
        <Dots color="hsla(180, 100%, 75%, 0.4)" />
      </Animator>
    </div>
  );
};

export default ArwesBackground;
