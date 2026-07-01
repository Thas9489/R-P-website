import Link from 'next/link'
import { FileText } from 'lucide-react'

export const metadata = { title: 'Terms of Service' }

const LAST_UPDATED = 'July 1, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

        <p>
          Welcome to <strong>ResumeAI</strong>. By accessing or using our platform you agree to be bound by these Terms of Service. Please read them carefully before creating an account or using any of our features.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>By registering for or using the ResumeAI service (&quot;Service&quot;), you agree to these Terms on behalf of yourself or the organisation you represent. If you do not agree, you may not use the Service.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>ResumeAI provides an AI-powered resume builder, portfolio generator, ATS scoring, and job-search tools. Features available to you depend on the subscription plan you choose. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
        </Section>

        <Section title="3. Accounts & Registration">
          <ul className="list-disc pl-5 space-y-1">
            <li>You must be at least 16 years old to create an account.</li>
            <li>You are responsible for maintaining the confidentiality of your credentials.</li>
            <li>You agree to provide accurate, current, and complete information during registration.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
          </ul>
        </Section>

        <Section title="4. Free Trial & Subscriptions">
          <p>
            Certain plans (including the Pro plan) may include a <strong>14-day free trial</strong>. No charge is made during the trial period. After the trial ends your chosen plan will automatically renew at the published rate unless you cancel before the trial period expires.
          </p>
          <p className="mt-2">
            You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period; no refunds are issued for unused portions of a paid period.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
            <li>Submit false, misleading, or fraudulent content.</li>
            <li>Attempt to reverse-engineer, scrape, or copy any part of the platform.</li>
            <li>Use automated tools or bots to interact with the Service without our prior written consent.</li>
            <li>Upload content that infringes intellectual property rights, is defamatory, or harmful.</li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content, features, and functionality of ResumeAI — including but not limited to software, text, graphics, logos, and AI-generated outputs — are owned by or licensed to ResumeAI and are protected by applicable intellectual property laws.
          </p>
          <p className="mt-2">
            Content you create using the Service (your resumes, portfolio data, etc.) remains yours. You grant ResumeAI a limited, non-exclusive licence to store and process that content solely to provide the Service to you.
          </p>
        </Section>

        <Section title="7. AI-Generated Content">
          <p>
            ResumeAI uses large language models to generate resume copy, ATS feedback, and other text. AI-generated content is provided as a starting point only. You are solely responsible for reviewing, editing, and verifying all content before using it in job applications or publishing it publicly.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. ResumeAI does not guarantee that the Service will be error-free, uninterrupted, or that AI suggestions will result in employment outcomes.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, ResumeAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of — or inability to use — the Service, even if we have been advised of the possibility of such damages.
          </p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>
            We may update these Terms from time to time. We will notify you of material changes by email or by posting a notice within the Service at least 14 days before the changes take effect. Continued use of the Service after the effective date constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved through binding arbitration or in courts of competent jurisdiction, as permitted by law.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about these Terms, please contact us at{' '}
            <a href="mailto:support@resumeai.app" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@resumeai.app
            </a>.
          </p>
        </Section>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">← Back to ResumeAI</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
      {children}
    </div>
  )
}
