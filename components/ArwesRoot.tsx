'use client';

import { ReactNode } from 'react';
import { Animator } from '@arwes/react-animator';
import { BleepsProvider } from '@arwes/react-bleeps';
import { bleepsSettings } from '@/config/bleeps';
import ArwesBackground from './ArwesBackground';

const ArwesRoot = ({ children }: { children: ReactNode }) => {
  return (
    <Animator active>
      <ArwesBackground />
      <BleepsProvider {...bleepsSettings}>
        {children}
      </BleepsProvider>
    </Animator>
  );
};

export default ArwesRoot;
