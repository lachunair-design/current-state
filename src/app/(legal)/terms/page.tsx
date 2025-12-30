import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sunset-50 via-bg-primary to-ocean-50 text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-accent-ocean hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Agreement to Terms</h2>
            <p>
              By accessing or using Current State ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you disagree with any part of these terms, you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Description of Service</h2>
            <p>
              Current State is a productivity application that helps users manage tasks, goals, and habits based on their
              current energy levels and mental state. The Service provides:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Daily energy check-in system</li>
              <li>Task management with energy-aware matching</li>
              <li>Goal tracking with SMART framework</li>
              <li>Habit tracking and completion</li>
              <li>Focus timer (Pomodoro technique)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">User Accounts</h2>

            <h3 className="text-xl font-semibold text-text-primary mb-2">Account Creation</h3>
            <p>To use Current State, you must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Be at least 13 years of age</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4">Account Responsibility</h3>
            <p>
              You are responsible for all activities that occur under your account. You agree to notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Acceptable Use</h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate another person or entity</li>
              <li>Transmit malicious code, viruses, or harmful data</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use automated systems (bots, scrapers) without permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">User Content</h2>

            <h3 className="text-xl font-semibold text-text-primary mb-2">Your Content</h3>
            <p>
              You retain all rights to the content you create in Current State (tasks, goals, habits, notes, etc.).
              By using the Service, you grant us a license to store, process, and display your content solely for the
              purpose of providing the Service to you.
            </p>

            <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4">Content Responsibility</h3>
            <p>
              You are solely responsible for the content you create. We do not monitor user content but reserve the
              right to remove content that violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Pricing and Payment</h2>
            <p>
              Current State is currently offered free of charge during our limited-time promotional period. We reserve
              the right to introduce paid plans in the future. If we do:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We will provide at least 30 days' notice before charging existing users</li>
              <li>Free tier options will remain available</li>
              <li>You may cancel your account at any time to avoid charges</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Current State and are
              protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The Service will be uninterrupted, secure, or error-free</li>
              <li>Any errors or defects will be corrected</li>
              <li>The Service will meet your specific requirements</li>
              <li>Results obtained from using the Service will be accurate or reliable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CURRENT STATE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
              OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. Please review our
              <Link href="/privacy" className="text-accent-ocean hover:underline mx-1">Privacy Policy</Link>
              to understand our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Account Termination</h2>

            <h3 className="text-xl font-semibold text-text-primary mb-2">By You</h3>
            <p>
              You may delete your account at any time through your profile settings. Upon deletion, all your personal
              data will be permanently removed within 30 days.
            </p>

            <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4">By Us</h3>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in
              behavior that we deem harmful to the Service or other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Sending an email notification to registered users</li>
              <li>Displaying a prominent notice in the application</li>
            </ul>
            <p className="mt-3">
              Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
              Current State operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or your use of the Service will be resolved through binding arbitration,
              except where prohibited by law. You agree to waive your right to participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or
              eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Contact Information</h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:legal@currentstate.app" className="text-accent-ocean hover:underline">legal@currentstate.app</a>
            </p>
          </section>

          <section className="border-t border-surface-border pt-6 mt-8">
            <p className="text-sm text-text-muted">
              By using Current State, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
