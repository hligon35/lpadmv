import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin approvals for training booking requests.',
  alternates: { canonical: '/admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout(props: { children: ReactNode }) {
  return props.children;
}
