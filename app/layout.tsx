import React from 'react';
import { Inter } from 'next/font/google';
import ArwesRoot from '@/components/ArwesRoot';
// import "./globals.css"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'XGate',
  description: 'A futuristic data dashboard.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, backgroundColor: '#000' }}>
        <ArwesRoot>
          {children}
        </ArwesRoot>
      </body>
    </html>
  );
}