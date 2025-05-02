// src/privacy.js
import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 px-6 py-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>

        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Welcome to Turbinix. This Privacy Policy describes how we collect, use, and protect your personal information. We are committed to safeguarding your privacy and ensuring the security of your data. This policy is designed to comply with applicable data protection laws, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
          </p>
        </section>

        {/* Data Collection */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">2. Data Collection</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We collect several types of information to provide and improve our services:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><strong>2.1 Personal Information:</strong> This includes your name, email address, username, password, and any other information you provide during registration or account setup.</li>
            <li><strong>2.2 Financial Information:</strong> When you connect your financial accounts through Plaid or manually enter data, we collect transaction details, account balances, and other related financial data.</li>
            <li><strong>2.3 Usage Data:</strong> We collect information about how you interact with our platform, such as your IP address, browser type, pages visited, and timestamps.</li>
            <li><strong>2.4 Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your browsing experience, personalize content, and analyze trends.</li>
          </ul>
        </section>

        {/* Data Usage */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">3. Data Usage</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We use your information for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><strong>3.1 Service Provision:</strong> To provide, maintain, and improve the Turbinix platform and its features.</li>
            <li><strong>3.2 Personalization:</strong> To personalize your experience, including providing tailored financial insights and recommendations.</li>
            <li><strong>3.3 Communication:</strong> To communicate with you about your account, updates, and promotional offers.</li>
            <li><strong>3.4 Security:</strong> To protect against fraud, unauthorized access, and other security risks.</li>
            <li><strong>3.5 Analytics:</strong> To analyze usage patterns and improve our platform's functionality and performance.</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">4. Data Sharing</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We may share your information with the following parties:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><strong>4.1 Third-Party Service Providers:</strong> We share data with service providers like Plaid to facilitate account linking and data aggregation. These providers are contractually obligated to protect your data.</li>
            <li><strong>4.2 Legal Compliance:</strong> We may disclose information to comply with legal obligations, enforce our terms of service, or respond to legal requests.</li>
            <li><strong>4.3 Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</li>
          </ul>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>We do not sell your personal information to third parties.</strong>
          </p>
        </section>

        {/* Data Security */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">5. Data Security</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We implement robust security measures to protect your information, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><strong>5.1 Encryption:</strong> Using encryption to protect data in transit and at rest.</li>
            <li><strong>5.2 Access Controls:</strong> Restricting access to your information to authorized personnel.</li>
            <li><strong>5.3 Regular Security Assessments:</strong> Conducting regular security audits and vulnerability assessments.</li>
            <li><strong>5.4 Plaid Security:</strong> Data obtained via Plaid is subject to Plaid's security practices, which we consider to be industry-leading.</li>
          </ul>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            While we strive to protect your data, no method of transmission over the internet is completely secure.
          </p>
        </section>

        {/* Your Rights */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">6. Your Rights</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You have certain rights regarding your personal information, depending on your location. These may include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li><strong>6.1 Access:</strong> The right to request access to your personal data.</li>
            <li><strong>6.2 Rectification:</strong> The right to correct inaccurate or incomplete data.</li>
            <li><strong>6.3 Erasure:</strong> The right to request deletion of your data (subject to legal limitations).</li>
            <li><strong>6.4 Objection:</strong> The right to object to the processing of your data for certain purposes.</li>
            <li><strong>6.5 Data Portability:</strong> The right to receive your data in a portable format.</li>
            <li><strong>6.6 Withdrawal of Consent:</strong> The right to withdraw consent at any time, where we rely on consent to process your data.</li>
          </ul>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            To exercise these rights, please contact us using the information below.
          </p>
        </section>

        {/* Data Retention */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">7. Data Retention</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        {/* Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">8. Children's Privacy</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Turbinix is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us, and we will take steps to delete it.
          </p>
        </section>

        {/* Policy Changes */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">9. Policy Changes</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes and post the updated policy on our platform.
          </p>
        </section>

        {/* Contact Information */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">10. Contact Information</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            If you have any questions or concerns about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;