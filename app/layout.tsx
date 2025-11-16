import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import ArwesRoot from '@/components/ArwesRoot';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'XGate',
  description: 'A futuristic data dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ArwesRoot>
          {children}
        </ArwesRoot>
      </body>
    </html>
  );
}