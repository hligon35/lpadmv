import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITE_URL } from '../../lib/siteUrl';

export const metadata: Metadata = {
  title: 'Book Training',
  description: 'Request training with Life Prep Academy DMV. Choose a program, frequency, and preferred days and times.',
  alternates: { canonical: '/book' },
  openGraph: {
    title: 'Book Training',
    description: 'Request training with Life Prep Academy DMV. Choose a program, frequency, and preferred days and times.',
    url: `${SITE_URL}/book`,
  },
  twitter: {
    title: 'Book Training',
    description: 'Request training with Life Prep Academy DMV. Choose a program, frequency, and preferred days and times.',
  },
};

export default function BookLayout(props: { children: ReactNode }) {
  return props.children;
}
