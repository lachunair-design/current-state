'use client'

import { CheckCircle, Battery, Target, Repeat, Timer, Zap } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Battery,
      title: '1. Daily Check-In',
      description: 'Start your day by telling us how you\'re feeling across 5 dimensions: energy, mental clarity, emotional state, available time, and environment quality.',
      tip: 'Be honest - there are no wrong answers. The more accurate you are, the better your task matches will be.',
    },
    {
      icon: Zap,
      title: '2. Get Matched Tasks',
      description: 'Our algorithm recommends 3-5 tasks that perfectly match your current state. High energy? Get deep work tasks. Low energy? Get lighter administrative tasks.',
      tip: 'You\'ll see these recommendations on your Dashboard as "Today\'s Focus".',
    },
    {
      icon: Target,
      title: '3. Set Goals & Create Tasks',
      description: 'Create SMART goals across different life areas (Career, Business, Health, etc.) and break them down into actionable tasks with energy requirements.',
      tip: 'Link tasks to goals so you can see which work actually moves the needle on what matters.',
    },
    {
      icon: Repeat,
      title: '4. Build Habits',
      description: 'Track habits you want to build or break. We\'ll remind you and celebrate your consistency.',
      tip: 'Keep it simple - just one button to mark complete. The app adapts to your energy over time.',
    },
    {
      icon: Timer,
      title: '5. Focus & Complete',
      description: 'Use the built-in Pomodoro timer on your top task. Choose 15, 25, or 45-minute focus sessions. Mark tasks complete when done and celebrate your wins!',
      tip: 'Browser notifications will alert you when your focus session is complete.',
    },
  ]

  const coreConcepts = [
    {
      title: 'Energy-Aware Matching',
      description: 'Not all tasks are created equal. A task requiring deep focus when you\'re exhausted is a recipe for frustration. We match tasks to your current state, not just your to-do list.',
    },
    {
      title: 'Anti-Productivity Philosophy',
      description: 'We don\'t guilt-trip you or track everything obsessively. You won\'t see "productivity scores" or red alerts. Progress over perfection, always.',
    },
    {
      title: 'Work Type Matters',
      description: 'Creative work hits different than admin work. Deep work needs focus, communication needs social energy. We understand this.',
    },
    {
      title: 'Time Estimates',
      description: 'From "Tiny" (5-15 min) to "Extended" (2+ hours). Match tasks to the time you actually have, not the time you wish you had.',
    },
  ]

  return (
    <div className="min-h-screen page-gradient text-text-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-ocean rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl md:text-5xl font-accent font-bold mb-4">
            How It Works
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Current State helps you work <span className="text-accent-ocean">with your energy</span>, not against it.
            Here's how to get the most out of it.
          </p>
        </div>

        {/* Main Steps */}
        <div className="space-y-12 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-surface-border rounded-2xl p-8 hover:border-accent-ocean/30 transition-colors"
            >
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-accent-ocean/10 rounded-xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-accent-ocean" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-accent font-bold mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-lg mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="bg-accent-ocean/5 border border-accent-ocean/20 rounded-lg p-4">
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold text-accent-ocean">💡 Pro tip:</span> {step.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Core Concepts */}
        <div className="mb-20">
          <h2 className="text-3xl font-accent font-bold mb-8 text-center">Core Concepts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {coreConcepts.map((concept, index) => (
              <div
                key={index}
                className="bg-white border border-surface-border rounded-xl p-6 hover:border-accent-ocean/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-accent-ocean flex-shrink-0 mt-0.5" />
                  <h4 className="text-lg font-semibold">{concept.title}</h4>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed ml-8">
                  {concept.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Task Attributes Guide */}
        <div className="bg-white border border-surface-border rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-accent font-bold mb-6">Understanding Task Attributes</h2>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-accent-ocean mb-2">Energy Required</h4>
              <ul className="text-text-secondary space-y-1 ml-4">
                <li>• <span className="text-text-primary">Low:</span> Can do when tired (emails, scheduling)</li>
                <li>• <span className="text-text-primary">Medium:</span> Need some focus (planning, reviewing)</li>
                <li>• <span className="text-text-primary">High:</span> Peak energy needed (writing, strategy, coding)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-accent-ocean mb-2">Work Type</h4>
              <ul className="text-text-secondary space-y-1 ml-4">
                <li>• <span className="text-text-primary">Deep Work:</span> High-focus, creative thinking</li>
                <li>• <span className="text-text-primary">Creative:</span> Brainstorming, design, ideation</li>
                <li>• <span className="text-text-primary">Admin:</span> Organizing, filing, routine tasks</li>
                <li>• <span className="text-text-primary">Communication:</span> Emails, calls, meetings</li>
                <li>• <span className="text-text-primary">Learning:</span> Reading, courses, research</li>
                <li>• <span className="text-text-primary">Physical:</span> Exercise, errands, physical tasks</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-accent-ocean mb-2">Priority Levels</h4>
              <ul className="text-text-secondary space-y-1 ml-4">
                <li>• <span className="text-text-primary">Must Do:</span> Time-sensitive, critical tasks</li>
                <li>• <span className="text-text-primary">Should Do:</span> Important but flexible timing</li>
                <li>• <span className="text-text-primary">Could Do:</span> Nice to have, low urgency</li>
                <li>• <span className="text-text-primary">Someday:</span> Backlog, future consideration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-accent-ocean/10 to-accent-ocean/5 border border-accent-ocean/30 rounded-2xl p-10">
          <h3 className="text-2xl font-accent font-bold mb-3">Ready to get started?</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Do your first check-in and see what tasks match your current energy.
          </p>
          <Link
            href="/checkin"
            className="inline-flex items-center gap-2 bg-accent-ocean text-black px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Start Check-In
            <Zap className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
