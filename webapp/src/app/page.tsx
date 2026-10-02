import Link from "next/link";

const steps = [
  { title: "Tell us the basics", desc: "Country, visa, and when you first arrived in the U.S." },
  { title: "Enter your documents", desc: "W-2, 1042-S, scholarship letters — structured entry, no guesswork." },
  { title: "Get your answer", desc: "Residency status, treaty eligibility, forms needed, and your refund estimate." },
];

const engines = [
  "Substantial Presence Test & 5-year exemption",
  "Tax treaty lookup for 60+ countries",
  "FICA exemption & refund eligibility",
  "Federal tax computation (Form 1040-NR)",
  "State filing requirements (10 states)",
  "Form 8843 / Schedule OI / Schedule NEC routing",
];

export default function Home() {
  return (
    <div className="flex-1">
      <header className="border-b border-black/10 dark:border-white/10">
        <nav className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">LumaTax</span>
          <Link
            href="/file"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Start your return
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-20 text-center">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">
            Built for F-1 international students
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
            Enter your documents. We figure out the rest.
          </h1>
          <p className="mt-5 text-lg text-black/60 dark:text-white/60 max-w-2xl mx-auto">
            No tax jargon. No guessing which forms you need. LumaTax runs a deterministic,
            rule-based tax engine — not an AI guess — to determine your residency status,
            treaty eligibility, and federal/state filing obligations.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/file"
              className="rounded-full bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Start your return — it&apos;s free to see your results
            </Link>
          </div>
          <p className="mt-4 text-xs text-black/40 dark:text-white/40">
            Every calculation is rule-based and cites its source. Nothing here is AI-generated tax advice.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14 border-t border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-semibold text-center mb-10">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-black/10 dark:border-white/10 p-6">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-black/60 dark:text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14 border-t border-black/10 dark:border-white/10">
          <h2 className="text-2xl font-semibold text-center mb-3">What runs under the hood</h2>
          <p className="text-center text-black/60 dark:text-white/60 mb-10 max-w-xl mx-auto">
            Every rule below is implemented as deterministic code, derived directly from IRS
            publications, the Internal Revenue Code, and tax treaty text — no language model
            touches your tax calculation.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
            {engines.map((e) => (
              <li key={e} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                {e}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14 border-t border-black/10 dark:border-white/10 text-center">
          <h2 className="text-2xl font-semibold mb-4">Not sure if your situation is simple?</h2>
          <p className="text-black/60 dark:text-white/60 max-w-xl mx-auto mb-6">
            LumaTax automatically flags complex situations — dual-status years, treaty cliff
            effects, ambiguous scholarship classification — for human tax-professional review
            instead of guessing.
          </p>
          <Link href="/file" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Start your return →
          </Link>
        </section>
      </main>

      <footer className="border-t border-black/10 dark:border-white/10 py-8">
        <div className="mx-auto max-w-5xl px-6 text-xs text-black/40 dark:text-white/40">
          LumaTax is a tax-preparation engine prototype. Not a substitute for advice from a
          licensed CPA or enrolled agent in complex situations.
        </div>
      </footer>
    </div>
  );
}
