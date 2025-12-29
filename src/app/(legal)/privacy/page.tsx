import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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

        <h1 className="text-4xl font-accent font-bold mb-4">Privacy Policy</h1>
        <p className="text-text-muted mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-invert max-w-none space-y-6 text-text-secondary">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Introduction</h2>
            <p>
              Welcome to Current State ("we," "our," or "us"). We are committed to protecting your privacy and personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our productivity application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-text-primary mb-2">Personal Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address</li>
              <li>Name</li>
              <li>Country and timezone</li>
              <li>Profile photo URL (if provided)</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4">Usage Data</h3>
            <p>We collect information about how you use Current State:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Daily check-in responses (energy levels, mental clarity, etc.)</li>
              <li>Tasks, goals, and habits you create</li>
              <li>Completion and activity timestamps</li>
              <li>Feature usage and interaction patterns</li>
            </ul>

            <h3 className="text-xl font-semibold text-text-primary mb-2 mt-4">Technical Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address (for security purposes)</li>
              <li>Cookies and local storage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Provide our service:</strong> Match tasks to your energy levels and deliver personalized recommendations</li>
              <li><strong>Improve the app:</strong> Analyze usage patterns to enhance features and user experience</li>
              <li><strong>Communicate with you:</strong> Send important updates, notifications, and respond to your requests</li>
              <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and security issues</li>
              <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and enforce our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase (a PostgreSQL database with enterprise-grade security). We implement:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Data Sharing and Disclosure</h2>
            <p>
              We <strong>do not sell your personal information</strong> to third parties. We may share your information only in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Service Providers:</strong> Supabase (database hosting), Vercel (application hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct your information through your profile settings</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data at any time from your profile page</li>
              <li><strong>Export:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Disable notifications and reminders in your settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Cookies and Tracking</h2>
            <p>
              We use essential cookies and local storage to maintain your session and remember your preferences. We do not use
              third-party advertising cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active. When you delete your account,
              we permanently delete all your personal data within 30 days, except where required by law to retain certain information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Children's Privacy</h2>
            <p>
              Current State is not intended for users under 13 years of age. We do not knowingly collect personal information
              from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">International Users</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. By using Current State,
              you consent to the transfer of your information to countries that may have different data protection laws than your country.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the
              new policy on this page and updating the "Last updated" date. Your continued use of Current State after such
              changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:privacy@currentstate.app" className="text-accent-ocean hover:underline">privacy@currentstate.app</a>
            </p>
          </section>

          <section className="border-t border-surface-border pt-6 mt-8">
            <p className="text-sm text-text-muted">
              This privacy policy is effective as of the date stated above and applies to all users of Current State.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
