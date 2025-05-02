// src/terms.js
import React from 'react';
import { Link } from 'react-router-dom';

function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 px-6 py-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Terms of Service</h1>

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            By accessing or using Turbinix, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with all of these terms, you are prohibited from using our platform.
          </p>
        </section>

        {/* Account Responsibilities */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. Account Responsibilities</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>2.1 Provide accurate, current, and complete information during registration.</li>
            <li>2.2 Keep your password secure and confidential.</li>
            <li>2.3 Notify us immediately of any unauthorized access to your account.</li>
            <li>2.4 Accept all responsibility for all activity that occurs under your account.</li>
          </ul>
        </section>

        {/* Financial Data Disclaimer */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Financial Data Disclaimer</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Turbinix provides tools and information for personal financial management. We are not a financial advisor. The information provided on our platform is for informational purposes only and should not be considered financial advice. You acknowledge that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>3.1 Financial decisions are your sole responsibility.</li>
            <li>3.2 Turbinix is not liable for any financial losses or damages resulting from your use of the platform.</li>
            <li>3.3 You should consult with a qualified financial advisor for personalized advice.</li>
          </ul>
        </section>

        {/* Third-Party Integration */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. Third-Party Integration</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Turbinix integrates with third-party services, such as Plaid, to provide certain features. You acknowledge and agree that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>4.1 Your use of Plaid is subject to Plaid's terms of service and privacy policy.</li>
            <li>4.2 Turbinix is not responsible for the availability, accuracy, or security of third-party services.</li>
            <li>4.3 We may share data with third-party providers to facilitate integrations, but only as necessary to provide the service.</li>
          </ul>
        </section>

        {/* Termination */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">5. Termination</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We may terminate or suspend your account and access to Turbinix at our discretion, without prior notice, if you violate these Terms of Service. You may also terminate your account at any time.
          </p>
        </section>

        {/* Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">6. Limitation of Liability</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            To the maximum extent permitted by law, Turbinix shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>6.1 Your use or inability to use Turbinix.</li>
            <li>6.2 Any unauthorized access to or use of our servers and/or any personal information stored therein.</li>
            <li>6.3 Any interruption or cessation of transmission to or from our platform.</li>
            <li>6.4 Any bugs, viruses, trojan horses, or the like that may be transmitted to or through our platform.</li>
            <li>6.5 Any errors or omissions in any content or for any loss or damage of any kind incurred as a result of your use of any content posted, transmitted, or otherwise made available via Turbinix.</li>
          </ul>
        </section>

        {/* Governing Law */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7. Governing Law</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            These Terms of Service shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">8. Changes to Terms</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We reserve the right to modify or replace these Terms of Service at any time. We will provide notice of any significant changes. Your continued use of Turbinix after any such changes constitutes your acceptance of the new Terms of Service.
          </p>
        </section>

        {/* Contact Information */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">9. Contact Information</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-sm text-blue-500 hover:underline">
            <a href="mailto:support@turbinix.one">support@turbinix.one</a>
          </p>
        </section>

        {/* Last Updated */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-8">
          Last Updated: May 1, 2025
        </p>

        {/* Footer Link */}
        <Link
          to="/"
          className="mt-10 inline-block text-blue-500 hover:underline text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TermsOfService;