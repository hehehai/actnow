import { site } from "@actnow/common";

export function HeroSection() {
  const [firstLine, secondLine] = site.tagline;
  return (
    <section
      aria-labelledby="home-title"
      className="container mx-auto max-w-7xl px-4 pt-8 pb-6 sm:pt-10"
    >
      <div className="border-b border-border pb-7">
        <p className="font-medium text-[11px] text-brand uppercase tracking-[0.16em]">
          Published on Actnow
        </p>
        <h1
          className="mt-2 max-w-3xl text-balance font-medium text-3xl leading-tight tracking-tight md:text-4xl"
          id="home-title"
        >
          {firstLine}
          {secondLine ? (
            <>
              <br className="hidden sm:block" /> {secondLine}
            </>
          ) : null}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
          Read the latest articles and updates from the Actnow team.
        </p>
      </div>
    </section>
  );
}
