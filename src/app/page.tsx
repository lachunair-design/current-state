import Link from 'next/link'
import { Zap, CheckCircle, TrendingUp, Battery, Clock, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-xl text-gray-900">Current State</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary">
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
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Work with your energy,
          <br />
          <span className="text-primary-600">not against it</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The productivity app for humans with fluctuating everything.
          Match tasks to your actual capacity, see which work pays, and stop feeling guilty.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
            Start for free <Zap className="w-5 h-5" />
          </Link>
          <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
            See how it works
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          No credit card required • Free forever
        </p>
      </section>

      {/* Features */}
      <section id="how-it-works" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stop fighting yourself. Start working smarter.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for freelancers, solopreneurs & multi-hyphenates who've quit every other productivity app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="card p-8">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Battery className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Check-in</h3>
            <p className="text-gray-600">
              5 quick questions about your current state. Takes 30 seconds.
              No judgment, just data.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card p-8">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Energy Matching</h3>
            <p className="text-gray-600">
              Get 2-3 tasks that actually match your energy, time, and focus right now.
              No overwhelming lists.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card p-8">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial ROI</h3>
            <p className="text-gray-600">
              See the dollar value of your tasks. Finally know which work actually pays.
            </p>
          </div>
        </div>
      </section>

      {/* Anti-guilt message */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            No "overdue" badges. No guilt.
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Tasks recirculate based on your capacity, not arbitrary deadlines.
            Because you're human, not a machine.
          </p>
          <p className="text-gray-600">
            Built for people with ADHD, chronic conditions, variable income,
            and anyone who's tired of productivity apps that assume you're always at 100%.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <Clock className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to work with yourself?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of multi-income professionals who've found a better way.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
            Get started free <Zap className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            Set up in under 2 minutes • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built for humans with fluctuating everything.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Current State. MIT License.</p>
        </div>
      </footer>
    </div>
  )
}
