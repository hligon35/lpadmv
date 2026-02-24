import { ButtonLink } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-lpa border border-lpa-cardBorder bg-gradient-to-br from-lpa-primary/25 via-lpa-bg to-lpa-bg p-8">
        <div className="max-w-3xl">
          <div className="text-sm font-semibold text-lpa-accent">DMV</div>
          <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">
            LEAD. TRAIN. PREPARE.
          </h1>
          <p className="mt-4 text-base text-lpa-mutedFg">
            Life Prep Academy develops athletes and leaders through intentional training, accountability, and community.
            Whether you’re sharpening fundamentals or preparing for the next level, we build habits that translate.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-lpa-mutedFg">
            Expect coaching that’s clear, energetic, and detail-driven—focused on technique, effort, and mindset.
            The goal is simple: leave every session more prepared than you arrived.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/book" variant="accent">
              Book Training
            </ButtonLink>
            <ButtonLink href="/about" variant="ghost">
              Learn More
            </ButtonLink>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">
          Mission
        </h2>
        <p className="mt-2 max-w-3xl text-lpa-mutedFg">
          We build confident athletes with a leadership-first mindset—on the field, in the classroom, and in life.
        </p>
        <p className="mt-3 max-w-3xl text-lpa-mutedFg">
          Our training connects performance and character: consistent habits, strong communication, and the discipline to do the
          small things right. We want athletes who lead by example and compete with purpose.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">
          Training Highlights
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm font-semibold text-lpa-accent">Position</div>
            <div className="mt-1 text-lg font-semibold">Skill Development</div>
            <p className="mt-2 text-sm text-lpa-mutedFg">
              Footwork, IQ, technique, and game-speed reps—built from the ground up with coaching you can repeat on your own.
            </p>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-lpa-accent">Strength</div>
            <div className="mt-1 text-lg font-semibold">Power + Durability</div>
            <p className="mt-2 text-sm text-lpa-mutedFg">
              Progressive programming with proper coaching—movement quality first, then load and speed.
            </p>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-lpa-accent">Leadership</div>
            <div className="mt-1 text-lg font-semibold">Mindset + Accountability</div>
            <p className="mt-2 text-sm text-lpa-mutedFg">
              Character, discipline, and confidence training—how to respond, reset, and keep showing up.
            </p>
          </Card>
        </div>
      </section>

      <section className="rounded-lpa border border-lpa-cardBorder bg-lpa-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-lpa-accent">Ready to get started?</div>
            <div className="mt-1 text-lg font-semibold">Book your first session today.</div>
            <div className="mt-1 text-sm text-lpa-mutedFg">
              Choose a package, request your preferred times, and we’ll follow up after approval with confirmation details.
            </div>
          </div>
          <ButtonLink href="/book" variant="accent">
            Book Training
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
