'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

import { type BleepsProviderSettings, BleepsProvider } from '@arwes/react';

const inter = Inter({ subsets: ['latin'] });

const bleepsSettings: BleepsProviderSettings = {
  master: {
    volume: 0.9
  },
  bleeps: {
    intro: {
      sources: [
        { src: 'https://arwes.dev/assets/sounds/intro.mp3', type: 'audio/mpeg' }
      ]
    },
    click: {
      sources: [
        { src: 'https://arwes.dev/assets/sounds/click.mp3', type: 'audio/mpeg' }
      ]
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>XGATE - Crypto Dashboard</title>
        <meta name="description" content="Track the latest crypto trends and pump tokens" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <BleepsProvider {...bleepsSettings}>
          <main>{children}</main>
        </BleepsProvider>
      </body>
    </html>
  );
}