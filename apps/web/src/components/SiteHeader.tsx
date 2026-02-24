import Link from 'next/link';
import Image from 'next/image';

const navLinkClass =
  'rounded-lpa px-3 py-2 text-sm font-semibold text-lpa-fg/90 hover:text-lpa-fg hover:bg-lpa-white/5';

export function SiteHeader() {
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

        <nav className="flex items-center gap-1">
          <Link className={navLinkClass} href="/">
            Home
          </Link>
          <Link className={navLinkClass} href="/about">
            About
          </Link>
          <Link className={navLinkClass} href="/book">
            Book
          </Link>
          <Link className={navLinkClass} href="/contact">
            Contact
          </Link>
          <a
            className={navLinkClass}
            href="https://www.lifeprepacademyfoundation.com"
            target="_blank"
            rel="noreferrer noopener"
          >
            Foundation
          </a>
        </nav>
      </div>
    </header>
  );
}
