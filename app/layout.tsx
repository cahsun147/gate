'use client';

import React from 'react';
import { Inter } from "next/font/google";
import "./globals.css";

import {
  ArwesProvider,
  SoundsProvider,
  StylesBaseline,
  Global
} from '@arwes/react';

import audioClick from '@arwes/sounds/assets/sounds/click.mp3';
import audioHover from '@arwes/sounds/assets/sounds/hover.mp3';
import audioType from '@arwes/sounds/assets/sounds/type.mp3';

const inter = Inter({ subsets: ["latin"] });

const players = {
  click: { sound: { src: [audioClick] } },
  hover: { sound: { src: [audioHover] } },
  type: { sound: { src: [audioType] }, loop: true }
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
        <ArwesProvider>
          <StylesBaseline />
          <Global />
          <SoundsProvider players={players}>
            <main>{children}</main>
          </SoundsProvider>
        </ArwesProvider>
      </body>
    </html>
  );
}