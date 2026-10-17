import React from 'react';
import type { Metadata } from 'next';
import logo from '../public/assets/vigor-forest.webp?inline';
import '@fontsource-variable/plus-jakarta-sans';
import '../src/styles/index.css';
export const metadata: Metadata = {
  title: 'Vigor | Greenhouse workspace',
  description: 'Greenhouse monitoring, crop care, harvests, and operating costs.',
  icons: { icon: logo },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
