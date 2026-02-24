import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '../../lib/siteUrl';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Life Prep Academy DMV for training availability, packages, and next steps.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact',
    description: 'Contact Life Prep Academy DMV for training availability, packages, and next steps.',
    url: `${SITE_URL}/contact`,
  },
  twitter: {
    title: 'Contact',
    description: 'Contact Life Prep Academy DMV for training availability, packages, and next steps.',
  },
};

export default function ContactLayout(props: { children: ReactNode }) {
  return props.children;
}
