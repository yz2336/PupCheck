import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-cream to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 font-bold text-brand">
          <span className="text-2xl">🐶</span>
          <span className="text-lg tracking-tight">PupCheck</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Sign up
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-dark">
              🐾 Your pup, our AI
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
              Your dog&rsquo;s AI-powered{" "}
              <span className="text-brand">wellness companion</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Upload a photo of your dog&rsquo;s poop, ears, teeth, skin, or eyes
              and get instant AI screening. Chat with a virtual vet assistant and
              track every scan over time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                Get started free 🐶
              </Link>
              <Link href="/login" className="btn-secondary">
                I already have an account
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              PupCheck is a screening assistant, not a substitute for a licensed
              veterinarian.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand/10 via-accent/10 to-white p-6 shadow-xl">
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="text-7xl md:text-8xl">🐕</div>
                <div className="grid grid-cols-3 gap-3">
                  <FeatureTile emoji="🔍" label="Scan" />
                  <FeatureTile emoji="💬" label="Chat" />
                  <FeatureTile emoji="📈" label="Track" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          How PupCheck works
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-gray-600">
          Three simple tools, one dashboard.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Feature
            emoji="🔍"
            title="Instant Scan"
            body="Snap a photo and our AI flags anything worth watching — from tartar buildup to ear infections."
          />
          <Feature
            emoji="💬"
            title="AI Vet Assistant"
            body="Ask any question about your dog's health. Our assistant knows their scan history and breed."
          />
          <Feature
            emoji="📈"
            title="Wellness Trends"
            body="See every scan on a timeline so you can spot patterns before they become problems."
          />
        </div>
      </section>

      <footer className="border-t border-black/5 py-6 text-center text-xs text-gray-400">
        PupCheck &copy; {new Date().getFullYear()} — made with 🐾 for dog parents.
      </footer>
    </main>
  );
}

function FeatureTile({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/80 p-4 shadow-sm">
      <div className="text-3xl">{emoji}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
    </div>
  );
}

function Feature({
  emoji,
  title,
  body,
}: {
  emoji: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-3 text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  );
}
