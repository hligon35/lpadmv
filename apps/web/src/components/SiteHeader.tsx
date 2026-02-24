"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';

const navLinkClass =
  'rounded-lpa px-3 py-2 text-sm font-semibold text-lpa-fg/90 hover:text-lpa-fg hover:bg-lpa-white/5';

type NavItem =
  | { kind: 'internal'; label: string; href: string }
  | { kind: 'external'; label: string; href: string };

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo<NavItem[]>(
    () => [
      { kind: 'internal', label: 'Home', href: '/' },
      { kind: 'internal', label: 'About', href: '/about' },
      { kind: 'internal', label: 'Book', href: '/book' },
      { kind: 'internal', label: 'Contact', href: '/contact' },
      { kind: 'external', label: 'Foundation', href: 'https://www.lifeprepacademyfoundation.com' },
    ],
    [],
  );

  return (
    <header className="border-b border-lpa-cardBorder/70 bg-lpa-bg/80 backdrop-blur">
      <div className="container-pad flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/lpadmvLogo.PNG"
            alt="Life Prep Academy DMV"
            width={72}
            height={72}
            className="h-18 w-18 rounded-lpa object-contain"
            priority
          />
          <div className="leading-tight">
            <div className="font-display font-semibold tracking-wide">
              LIFE PREP ACADEMY
            </div>
            <div className="text-xs text-lpa-mutedFg">DMV</div>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) =>
            item.kind === 'internal' ? (
              <Link key={item.href} className={navLinkClass} href={item.href}>
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                className={navLinkClass}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        {/* Mobile hamburger */}
        {mobileOpen ? (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lpa p-2 text-lpa-fg/90 hover:bg-lpa-white/5 hover:text-lpa-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lpa-accent md:hidden"
            aria-controls="mobile-nav"
            aria-expanded="true"
            onClick={() => setMobileOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <div className="flex flex-col gap-1">
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
            </div>
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lpa p-2 text-lpa-fg/90 hover:bg-lpa-white/5 hover:text-lpa-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lpa-accent md:hidden"
            aria-controls="mobile-nav"
            aria-expanded="false"
            onClick={() => setMobileOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <div className="flex flex-col gap-1">
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
              <span className="block h-0.5 w-6 bg-current" />
            </div>
          </button>
        )}
      </div>

      {/* Mobile dropdown navigation */}
      {mobileOpen ? (
        <div id="mobile-nav" className="border-t border-lpa-cardBorder/70 bg-lpa-bg/90 backdrop-blur md:hidden">
          <div className="container-pad flex flex-col gap-1 py-3">
            {navItems.map((item) =>
              item.kind === 'internal' ? (
                <Link
                  key={item.href}
                  className={navLinkClass}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  className={navLinkClass}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ),
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
