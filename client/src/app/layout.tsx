import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Chirp - Connect and Share',
  description: 'A modern social platform for sharing thoughts and connecting with others',
  keywords: ['social media', 'twitter clone', 'chirp', 'social network'],
  authors: [{ name: 'Chirp Team' }],
  creator: 'Chirp',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chirp-social.vercel.app',
    siteName: 'Chirp',
    title: 'Chirp - Connect and Share',
    description: 'A modern social platform for sharing thoughts and connecting with others',
    images: [
      {
        url: 'https://chirp-social.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chirp Social Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chirp - Connect and Share',
    description: 'A modern social platform for sharing thoughts and connecting with others',
    creator: '@chirp',
    images: ['https://chirp-social.vercel.app/twitter-image.jpg'],
  },
  manifest: 'https://chirp-social.vercel.app/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}