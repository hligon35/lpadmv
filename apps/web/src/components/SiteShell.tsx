import type { ReactNode } from 'react';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function SiteShell(props: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lpa focus:bg-lpa-card focus:px-4 focus:py-2 focus:text-lpa-fg"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="container-pad py-10">
        {props.children}
      </main>
      <SiteFooter />
    </div>
  );
}
