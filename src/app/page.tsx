import Link from 'next/link'
import { ArrowRight, Zap, Target, Brain, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-gray-900">Current State</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            Work with your energy,
            <br />
            <span className="text-primary-600">not against it</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            The productivity app for humans with fluctuating everything. 
            Match tasks to your actual capacity, see which work pays, 
            and stop feeling guilty about being human.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-3">
              See How It Works
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required. Built for freelancers, solopreneurs & multi-hyphenates.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Sound familiar?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "I have 47 overdue tasks and I've stopped opening my task app",
              "Some days I can work 10 hours, other days I can barely send an email",
              "I'm busy all the time but have no idea which work actually pays",
              "I quit every productivity app after 2 weeks because they make me feel worse",
            ].map((quote, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                <p className="text-gray-700 italic">"{quote}"</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-gray-600">
            Traditional productivity apps assume you have the same energy every day. You don't. 
            <span className="font-medium text-gray-900"> Neither do the 70 million other gig workers.</span>
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How Current State Works</h2>
            <p className="mt-4 text-lg text-gray-600">Three steps. Thirty seconds. Zero guilt.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Quick Check-in</h3>
              <p className="text-gray-600">
                Answer 5 quick questions about your energy, focus, and time available. Takes 30 seconds.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Matched Tasks</h3>
              <p className="text-gray-600">
                Get 2-3 tasks that actually match your current state. Low energy? Admin tasks. High energy? Deep work.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. See Your Progress</h3>
              <p className="text-gray-600">
                Track momentum, not perfection. See which goals you're advancing and what value you're generating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Built Different</h2>
            <p className="mt-4 text-lg text-gray-600">For people who've quit productivity apps</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-2xl mb-4">🚫</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No "Overdue" Badges</h3>
              <p className="text-gray-600">
                Tasks recirculate based on your capacity, not arbitrary deadlines. 
                No shame. No guilt spiral.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-2xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial ROI Visibility</h3>
              <p className="text-gray-600">
                Know which work actually pays. See the dollar value of your tasks 
                and which income streams need attention.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-2xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Energy-Aware Matching</h3>
              <p className="text-gray-600">
                Tired? Here's admin work. Focused? Deep work time. 
                Work WITH your natural rhythms.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-200">
              <div className="text-2xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Decision Reduction</h3>
              <p className="text-gray-600">
                See 2-3 tasks, not 47. We reduce decision paralysis 
                so you can actually start working.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to work with your energy?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join other multi-income professionals who stopped fighting their natural rhythms.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-3 mt-8 inline-flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-600 rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Current State</span>
            </div>
            <p className="text-sm text-gray-500">
              Built for humans with fluctuating everything.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
