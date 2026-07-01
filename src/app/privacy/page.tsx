import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export const metadata = { title: 'Privacy Policy' }

const LAST_UPDATED = 'July 1, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

        <p>
          Your privacy matters to us. This Privacy Policy explains how <strong>ResumeAI</strong> collects, uses, and protects your personal information when you use our platform. By using ResumeAI you agree to the practices described in this Policy.
        </p>

        <Section title="1. Information We Collect">
          <p className="mb-2 font-medium text-gray-800 dark:text-gray-200">Information you provide directly:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Account details — name, email address, and password.</li>
            <li>Resume content — work history, education, skills, and other career information you enter.</li>
            <li>Portfolio data — bio, projects, and profile images you upload.</li>
            <li>Payment information — processed securely by our payment provider; we do not store card details.</li>
          </ul>
          <p className="mb-2 font-medium text-gray-800 dark:text-gray-200">Information collected automatically:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usage data — pages visited, features used, and session duration.</li>
            <li>Device and browser information — IP address, browser type, and operating system.</li>
            <li>Cookies and similar technologies — used to keep you signed in and improve your experience.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide, maintain, and improve the Service.</li>
            <li>To process AI requests (resume generation, ATS scoring) on your behalf.</li>
            <li>To send transactional emails such as account confirmations and billing receipts.</li>
            <li>To send product updates and newsletters (you may opt out at any time).</li>
            <li>To detect fraud, abuse, and security incidents.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </Section>

        <Section title="3. AI & Third-Party Models">
          <p>
            Resume content and job descriptions you submit for AI processing are sent to third-party large language model providers (such as OpenRouter or OpenAI) solely to generate the requested output. These providers are contractually prohibited from using your data to train their models. We do not sell your personal information to any third party.
          </p>
        </Section>

        <Section title="4. Data Sharing">
          <p>We do not sell your personal data. We may share information with:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Service providers</strong> — hosting, analytics, payment processing, and email delivery, under strict data-processing agreements.</li>
            <li><strong>Legal authorities</strong> — when required by law, court order, or to protect the rights and safety of ResumeAI and its users.</li>
            <li><strong>Business transfers</strong> — in the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity.</li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>
            We use essential cookies to keep you authenticated and remember your preferences. We may also use analytics cookies (e.g. aggregated usage statistics) to understand how the Service is used. You can control cookie preferences through your browser settings; disabling certain cookies may affect Service functionality.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account data for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g. resolving disputes or fraud prevention).
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We use industry-standard measures including encryption in transit (TLS), encrypted storage, and access controls to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate or incomplete data.</li>
            <li>Request deletion of your data (&quot;right to be forgotten&quot;).</li>
            <li>Object to or restrict certain types of processing.</li>
            <li>Export your data in a portable format.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:privacy@resumeai.app" className="text-blue-600 dark:text-blue-400 hover:underline">
              privacy@resumeai.app
            </a>. We will respond within 30 days.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            The Service is not directed at children under 16. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes by email or by a notice within the Service. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have questions or concerns about this Privacy Policy or how we handle your data, please reach out at{' '}
            <a href="mailto:privacy@resumeai.app" className="text-blue-600 dark:text-blue-400 hover:underline">
              privacy@resumeai.app
            </a>.
          </p>
        </Section>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
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
