import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function SiteShell(props: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="container-pad py-10">{props.children}</main>
      <SiteFooter />
    </div>
  );
}
