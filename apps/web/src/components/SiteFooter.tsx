import Image from 'next/image';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-lpa-cardBorder/70">
      <div className="container-pad py-10 text-sm text-lpa-mutedFg">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/lpadmvLogo.PNG"
              alt="Life Prep Academy DMV"
              width={144}
              height={144}
              className="h-36 w-36 rounded-lpa object-contain"
            />
            <div className="leading-tight">
              <div className="font-semibold text-lpa-fg">Life Prep Academy DMV</div>
              <div>Leadership + Athletic Development</div>
            </div>
          </div>
          <div className="flex gap-4">
            <a className="hover:text-lpa-fg" href="#" aria-label="Instagram">
              Instagram
            </a>
            <a className="hover:text-lpa-fg" href="#" aria-label="Facebook">
              Facebook
            </a>
            <a className="hover:text-lpa-fg" href="#" aria-label="TikTok">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
