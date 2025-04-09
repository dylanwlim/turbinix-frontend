import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <h1 className="text-4xl font-bold mb-4 text-center">Welcome to Turbinix 💡</h1>
      <p className="text-lg text-center max-w-xl mb-6">
        Your modern command center for managing finances, real estate tools, documents, and budgeting — all in one place.
      </p>

      <div className="flex gap-4 mb-8">
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg transition"
        >
          Get Started
        </Link>
        <a
          href="#features"
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white px-6 py-3 rounded-xl text-lg transition"
        >
          Learn More
        </a>
      </div>

      <section id="features" className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <FeatureCard title="📊 Finance Dashboard" desc="Track properties, banks, and balances visually." />
        <FeatureCard title="🏠 Real Estate Tools (Soon)" desc="Analyze properties, ownership data, and forecasts." />
        <FeatureCard title="🧾 Document Vault (Soon)" desc="Store and retrieve investment documents securely." />
        <FeatureCard title="💵 Budgeting Tool (Soon)" desc="Track spending, savings, and income in real time." />
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
    </div>
  );
}

export default Home;
