import Image from 'next/image';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-lpa-cardBorder/70">
      <div className="container-pad py-10 text-sm text-lpa-mutedFg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

              <div className="mt-3 flex justify-center gap-4 text-lpa-mutedFg sm:justify-start">
                <a
                  href="https://www.instagram.com/p/Cnk9l9fuA2S/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-lpa-fg"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/lifeprepacademydmv/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-lpa-fg"
                >
                  Facebook
                </a>
                <a
                  href="https://www.youtube.com/@lifeprepacademydmv6645"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-lpa-fg"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-lpa-mutedFg">
          © {year} Life Prep Academy DMV. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
