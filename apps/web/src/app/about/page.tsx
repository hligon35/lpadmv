import Image from 'next/image';
import type { Metadata } from 'next';
import { SITE_URL } from '../../lib/siteUrl';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Life Prep Academy DMV—our mission, training approach, and founder-driven purpose.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About',
    description: 'Learn about Life Prep Academy DMV—our mission, training approach, and founder-driven purpose.',
    url: `${SITE_URL}/about`,
  },
  twitter: {
    title: 'About',
    description: 'Learn about Life Prep Academy DMV—our mission, training approach, and founder-driven purpose.',
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="text-sm font-semibold text-lpa-accent">About</div>
        <h1 className="font-display text-5xl leading-none">
          OUR STORY
        </h1>
        <p className="max-w-3xl text-lpa-mutedFg">
          Life Prep Academy is built on the belief that athletic development and leadership development are inseparable.
          We train the whole athlete: skill, strength, mindset, and character.
        </p>
        <p className="max-w-3xl text-lpa-mutedFg">
          Our approach is simple and consistent: master the fundamentals, train with purpose, and build habits that show up on game
          day and in everyday life. Every rep is an opportunity to lead.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
          <div className="text-sm font-semibold text-lpa-accent">Leadership</div>
          <div className="mt-2 text-lg font-semibold">Accountability</div>
          <p className="mt-2 text-sm text-lpa-mutedFg">
            Show up, lock in, finish strong. We set standards, keep them clear, and help athletes learn how to hold themselves to
            them.
          </p>
        </div>
        <div className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
          <div className="text-sm font-semibold text-lpa-accent">Athletics</div>
          <div className="mt-2 text-lg font-semibold">Skill + Strength</div>
          <p className="mt-2 text-sm text-lpa-mutedFg">
            Technique and durability that translate to game day. We coach details and pace so athletes can perform with confidence.
          </p>
        </div>
        <div className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
          <div className="text-sm font-semibold text-lpa-accent">Life Prep</div>
          <div className="mt-2 text-lg font-semibold">Mindset</div>
          <p className="mt-2 text-sm text-lpa-mutedFg">
            Confidence, discipline, and consistent habits. We teach athletes how to reset, respond, and keep improving.
          </p>
        </div>
      </section>

      <section className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
        <div className="grid gap-6 md:grid-cols-[auto,1fr] md:items-center">
          <Image
            src="/bhallcut.png"
            alt="Bryan Hall"
            width={320}
            height={320}
            className="h-40 w-40 rounded-lpa object-cover md:h-60 md:w-60"
            priority
          />
          <div className="space-y-3">
            <div className="text-sm font-semibold text-lpa-accent">Founder</div>
            <h2 className="font-display text-2xl font-semibold">Bryan Hall</h2>
            <p className="max-w-3xl text-lpa-mutedFg">
              Bryan Hall is a former professional American football player and a Super Bowl XLVII champion with the Baltimore Ravens
              (2013). Raised in Paducah, Kentucky, he pushed through early obstacles to pursue the game he loved and reach the
              highest level.
            </p>
            <p className="max-w-3xl text-lpa-mutedFg">
              Today, as the founder of the Life Prep Academy Foundation, Bryan is committed to creating measurable opportunities
              for youth and families in Baltimore, Maryland and Paducah, Kentucky—supporting mental wellness, athletic development,
              financial literacy, and leadership growth.
            </p>
            <p className="max-w-3xl text-lpa-mutedFg">
              His story has evolved from perseverance into purpose, shaping the Foundation’s whole-person model that strengthens the
              mind, trains the body, and builds future readiness—opening pathways to stability, confidence, and leadership.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">
          Athletic Development
        </h2>
        <p className="max-w-3xl text-lpa-mutedFg">
          We coach with purpose—teaching fundamentals, building strength, and developing athletes who can perform at speed.
        </p>
        <p className="max-w-3xl text-lpa-mutedFg">
          Sessions are structured, high-energy, and focused on transferable work: movement quality, tempo, decision-making, and
          repeatable technique.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-2xl font-semibold">
          Leadership Development
        </h2>
        <p className="max-w-3xl text-lpa-mutedFg">
          We reinforce integrity, communication, and resilience—skills that last longer than a season.
        </p>
        <p className="max-w-3xl text-lpa-mutedFg">
          That means learning how to be coachable, how to lead when you’re tired, and how to take ownership of preparation.
        </p>
      </section>
    </div>
  );
}
