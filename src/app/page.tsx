import Link from 'next/link'
import { Zap, CheckCircle, TrendingUp, Battery, Target, Sparkles, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sunset-50 via-bg-primary to-ocean-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 sm:py-6 border-b border-surface-border backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-flow rounded-xl flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="font-semibold text-lg sm:text-xl text-text-primary">Current State</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/login" className="px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-4 py-2 sm:px-6 rounded-lg font-semibold text-sm sm:text-base bg-gradient-ocean text-white hover:shadow-lg hover:scale-105 transition-all">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
        <div className="animate-fade-in">
          {/* Free Trial Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-sunset rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 shadow-md">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            <span className="text-xs sm:text-sm font-semibold text-white">Free for a limited time • No card required</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4 sm:mb-6 leading-tight px-4">
            Work with your energy,
            <br />
            <span className="bg-gradient-flow bg-clip-text text-transparent">
              not against it
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            The productivity app for humans with fluctuating everything.
            Match tasks to your actual capacity, see which work pays, and stop feeling guilty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="text-lg px-8 py-4 rounded-xl font-semibold bg-gradient-ocean text-white shadow-lg shadow-ocean-500/30 hover:shadow-xl hover:shadow-ocean-500/40 hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 rounded-xl font-medium text-text-secondary bg-white border-2 border-surface-border hover:border-ocean-400 hover:bg-surface-hover hover:text-text-primary inline-flex items-center justify-center hover:-translate-y-0.5 transition-all">
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
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Stop fighting yourself. Start working smarter.
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Built for freelancers, solopreneurs & multi-hyphenates who've quit every other productivity app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 - Sunset theme */}
          <div className="bg-white border-2 border-sunset-200 rounded-2xl p-8 hover:border-sunset-400 hover:shadow-xl hover:shadow-sunset-200/50 transition-all group">
            <div className="w-12 h-12 bg-gradient-sunset rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <Battery className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Daily Check-in</h3>
            <p className="text-text-secondary">
              5 quick questions about your current state. Takes 30 seconds.
              No judgment, just data.
            </p>
          </div>

          {/* Feature 2 - Mint theme */}
          <div className="bg-white border-2 border-ocean-200 rounded-2xl p-8 hover:border-ocean-400 hover:shadow-xl hover:shadow-ocean-200/50 transition-all group">
            <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Energy Matching</h3>
            <p className="text-text-secondary">
              Get 2-3 tasks that actually match your energy, time, and focus right now.
              No overwhelming lists.
            </p>
          </div>

          {/* Feature 3 - Full gradient */}
          <div className="bg-white border-2 border-sunset-200 rounded-2xl p-8 hover:border-ocean-400 hover:shadow-xl hover:shadow-accent-mint/50 transition-all group">
            <div className="w-12 h-12 bg-gradient-flow rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
              <TrendingUp className="w-6 h-6 text-white" />
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
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-ocean-100 via-white to-sunset-100 border-2 border-ocean-300 rounded-2xl p-12 text-center shadow-xl">
          <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4">
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
          <div className="w-16 h-16 bg-gradient-flow rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Ready to work with yourself?
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Join multi-income professionals who've found a better way to work.
          </p>
          <Link href="/signup" className="text-lg px-8 py-4 rounded-xl font-semibold bg-gradient-flow text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2">
            Get started free <Zap className="w-5 h-5" />
          </Link>
          <p className="text-sm text-text-muted mt-4">
            Free for a limited time • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-flow rounded-lg"></div>
            <span className="font-semibold text-text-primary">Current State</span>
          </div>
          <p className="text-text-muted text-sm mb-2">Built for humans with fluctuating everything.</p>
          <div className="flex items-center justify-center gap-4 text-sm text-text-secondary mb-2">
            <Link href="/privacy" className="hover:text-ocean-600 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-ocean-600 transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-text-muted">&copy; {new Date().getFullYear()} Current State. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
