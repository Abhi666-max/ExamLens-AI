import Link from "next/link";
import { UploadCloud, BarChart3, CalendarDays, ArrowRight, CheckCircle2, MessageSquare, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">

      {/* ── Hero Section ── */}
      <section className="w-full relative overflow-hidden flex flex-col items-center pt-28 pb-36 px-4">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-900/25 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-sm text-indigo-300 font-medium backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Powered by Gemini 1.5 Flash
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-none">
            Unfold Success with{" "}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              AI Exam Intelligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Stop guessing what will be on the exam. ExamLens AI analyzes historical papers, maps
            topic frequency, and generates a personalized study planner focused on high-yield topics.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/login?mode=signup"
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-medium transition-all shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50"
            >
              Start Analyzing Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="text-zinc-300 hover:text-white px-8 py-4 rounded-full font-medium border border-zinc-800 hover:bg-zinc-900 transition-all"
            >
              See how it works
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 pt-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-indigo-400" /> Secure & private</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Results in seconds</span>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="w-full bg-zinc-900/30 border-y border-zinc-800/50 py-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Core Features</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Everything you need to ace your exams
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Our AI engine works tirelessly to decode exam patterns so you can study smarter, not harder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <UploadCloud className="w-6 h-6 text-indigo-400" />,
                bg: "bg-indigo-500/10",
                border: "hover:border-indigo-500/50",
                title: "Multi-Paper Upload",
                desc: "Upload multiple past papers in PDF format. Our system processes and prepares them for deep AI analysis instantly.",
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-cyan-400" />,
                bg: "bg-cyan-500/10",
                border: "hover:border-cyan-500/50",
                title: "AI Pattern Analysis",
                desc: "Gemini 1.5 Flash maps topic frequency and ranks high-yield concepts to show you exactly what to focus on.",
              },
              {
                icon: <CalendarDays className="w-6 h-6 text-purple-400" />,
                bg: "bg-purple-500/10",
                border: "hover:border-purple-500/50",
                title: "Smart Study Planner",
                desc: "Get a personalized, time-optimized study schedule based on highest-probability topics to maximize your score.",
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-pink-400" />,
                bg: "bg-pink-500/10",
                border: "hover:border-pink-500/50",
                title: "AI Tutor Chat",
                desc: "Chat with ExamLens AI about your topics, ask for explanations, and get study guidance tailored to your papers.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-8 ${feature.border} transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section className="w-full py-28 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-lg">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col">
              <div className="flex-grow">
                <h3 className="text-2xl font-semibold text-white mb-1">Free</h3>
                <p className="text-zinc-400 mb-6 text-sm">Perfect for trying out ExamLens AI.</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-zinc-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Analyze up to 3 papers/month", "Basic pattern analysis", "Standard study planner"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/login?mode=signup"
                className="block w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-center rounded-xl font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-indigo-900/40 to-zinc-900 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-400" />
              <div className="absolute top-6 right-6 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20">
                RECOMMENDED
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-semibold text-white mb-1">Pro</h3>
                <p className="text-indigo-200/70 mb-6 text-sm">For serious students who want an edge.</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-bold text-white">$9</span>
                  <span className="text-indigo-200/60">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited paper analysis",
                    "Deep AI insights with Gemini 1.5 Flash",
                    "Dynamic & adaptive study planner",
                    "AI Tutor with full context memory",
                    "Export to PDF / Calendar",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-zinc-300 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/login?mode=signup"
                className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-center rounded-xl font-medium transition-colors shadow-lg shadow-indigo-900/30"
              >
                Get Started with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder CTA Section ── */}
      <section className="w-full px-4 pb-28">
        <div className="container mx-auto max-w-3xl">
          <div className="relative bg-gradient-to-br from-indigo-900/40 via-zinc-900 to-zinc-900 border border-indigo-800/30 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-4">Built for Students. By a Student.</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to unlock your exam potential?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
              Join thousands of students using ExamLens AI to study smarter, beat the exam, and achieve their goals.
            </p>
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-medium transition-all shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 group"
            >
              Start for Free Today
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-6 text-zinc-600 text-xs">
              Founded &amp; Built by <span className="text-indigo-400">Abhijeet Kangane</span>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
