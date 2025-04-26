import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolaKit Example',
  description:
    'A simple example of using SolaKit with tool calling and message history',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
