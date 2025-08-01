import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/utils/theme';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Doha Design System v2.0',
  description: '세계 최고 수준의 디자인 시스템 - Linear, Vercel, Stripe 벤치마킹',
  keywords: [
    'design system',
    'react',
    'typescript',
    'tailwind',
    'storybook',
    'accessibility',
    'ui components',
  ],
  authors: [
    {
      name: 'Doha Design Team',
      url: 'https://doha.kr',
    },
  ],
  creator: 'Doha Design Team',
  metadataBase: new URL('https://design.doha.kr'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://design.doha.kr',
    title: 'Doha Design System v2.0',
    description: '세계 최고 수준의 디자인 시스템',
    siteName: 'Doha Design System',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Doha Design System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doha Design System v2.0',
    description: '세계 최고 수준의 디자인 시스템',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@100;200;300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="light"
          storageKey="doha-ui-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
} 