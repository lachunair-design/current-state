import Link from 'next/link'
import { Zap, CheckCircle, TrendingUp, Battery, Target, Sparkles, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-text-primary">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent-green rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="font-accent font-semibold text-xl text-text-primary">Current State</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 rounded-lg font-medium text-text-secondary hover:text-text-primary hover:bg-dark-hover transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="animate-fade-in">
          {/* Free Trial Badge */}
          <div className="inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-accent-green" />
            <span className="text-sm font-medium text-accent-green">Free for a limited time • No credit card required</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-accent font-bold text-text-primary mb-6 leading-tight">
            Work with your energy,
            <br />
            <span className="text-accent-green">
              not against it
            </span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            The productivity app for humans with fluctuating everything.
            Match tasks to your actual capacity, see which work pays, and stop feeling guilty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2 shadow-lg shadow-accent-green/20 hover:shadow-xl hover:shadow-accent-green/30 hover:-translate-y-0.5 transition-all">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 rounded-lg font-medium text-text-secondary border border-dark-border hover:border-accent-green/30 hover:bg-dark-hover hover:text-text-primary inline-flex items-center justify-center hover:-translate-y-0.5 transition-all">
              See how it works
            </Link>
          </div>
          <p className="text-sm text-text-muted mt-4">
            Set up in under 2 minutes • Free forever
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-accent font-bold text-text-primary mb-4">
            Stop fighting yourself. Start working smarter.
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built for freelancers, solopreneurs & multi-hyphenates who've quit every other productivity app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-accent-green/30 transition-all group">
            <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Battery className="w-6 h-6 text-accent-green" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Daily Check-in</h3>
            <p className="text-text-secondary">
              5 quick questions about your current state. Takes 30 seconds.
              No judgment, just data.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-accent-green/30 transition-all group">
            <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-accent-green" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Energy Matching</h3>
            <p className="text-text-secondary">
              Get 2-3 tasks that actually match your energy, time, and focus right now.
              No overwhelming lists.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-8 hover:border-accent-green/30 transition-all group">
            <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-accent-green" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Financial ROI</h3>
            <p className="text-text-secondary">
              See the dollar value of your tasks. Finally know which work actually pays.
            </p>
          </div>
        </div>
      </section>

      {/* Anti-guilt message */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-accent-green/10 to-transparent border border-accent-green/30 rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-accent-green mx-auto mb-6" />
          <h2 className="text-3xl font-accent font-bold text-text-primary mb-4">
            No "overdue" badges. No guilt.
          </h2>
          <p className="text-lg text-text-secondary mb-4">
            Tasks recirculate based on your capacity, not arbitrary deadlines.
            Because you're human, not a machine.
          </p>
          <p className="text-text-secondary">
            Built for people with ADHD, chronic conditions, variable income,
            and anyone who's tired of productivity apps that assume you're always at 100%.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <Zap className="w-16 h-16 text-accent-green mx-auto mb-6" />
          <h2 className="text-4xl font-accent font-bold text-text-primary mb-4">
            Ready to work with yourself?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Join multi-income professionals who've found a better way to work.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            Get started free <Zap className="w-5 h-5" />
          </Link>
          <p className="text-sm text-text-muted mt-4">
            Free for a limited time • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8">
        <div className="container mx-auto px-4 text-center text-text-muted text-sm">
          <p>Built for humans with fluctuating everything.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Current State. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
