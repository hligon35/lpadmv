import type { Metadata } from "next";
import Script from 'next/script';
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "../components/SiteShell";
import { SITE_URL } from '../lib/siteUrl';

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Life Prep Academy DMV',
    template: '%s | Life Prep Academy DMV',
  },
  description: 'Leadership-first athletic training and development in the DMV.',
  applicationName: 'Life Prep Academy DMV',
  referrer: 'strict-origin-when-cross-origin',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'Life Prep Academy DMV',
    'athletic training DMV',
    'sports performance training',
    'youth athlete development',
    'leadership development',
    'strength and conditioning',
    'football training',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Life Prep Academy DMV',
    title: 'Life Prep Academy DMV',
    description: 'Leadership-first athletic training and development in the DMV.',
    images: [{ url: '/lpadmvLogo.PNG', width: 512, height: 512, alt: 'Life Prep Academy DMV logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Life Prep Academy DMV',
    description: 'Leadership-first athletic training and development in the DMV.',
    images: ['/lpadmvLogo.PNG'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: "/lpadmvLogo.PNG",
    apple: "/lpadmvLogo.PNG",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Life Prep Academy DMV',
    url: SITE_URL,
  };

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Life Prep Academy DMV',
    url: SITE_URL,
    logo: `${SITE_URL}/lpadmvLogo.PNG`,
  };

  return (
    <html lang="en" className={`${inter.variable} ${bebas.variable}`}>
      <body className="min-h-dvh bg-lpa-bg text-lpa-fg">
        <Script
          id="jsonld-website"
          type="application/ld+json"
          // JSON-LD is a no-layout, SEO-only enhancement.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <Script
          id="jsonld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
