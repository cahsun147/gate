'use client';

import { ReactNode } from 'react';
import { Animator } from '@arwes/react-animator';
import { BleepsProvider } from '@arwes/react-bleeps';

// File suara ada di /public/sounds/
const bleepsSettings = {
  common: { volume: 0.8 },
  bleeps: {
    click: { sources: [{ src: '/sounds/click.mp3', type: 'audio/mpeg' }] },
    type: { sources: [{ src: '/sounds/type.mp3', type: 'audio/mpeg' }], loop: true }
  }
};

const ArwesRoot = ({ children }: { children: ReactNode }) => {
  return (
    <Animator active>
      <BleepsProvider {...bleepsSettings}>
        {children}
      </BleepsProvider>
    </Animator>
  );
};

export default ArwesRoot;
