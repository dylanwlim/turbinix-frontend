// src/Billing.js
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

function Billing() {
  const isTrialActive = true; // Placeholder
  const daysRemaining = 21;   // Placeholder
  const currentPlan = isTrialActive ? 'Free Trial' : 'Turbinix Pro';

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 sm:px-6 pt-20 pb-20">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-8 text-center"
        >
          Billing & Subscription
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className={`w-8 h-8 flex-shrink-0 ${isTrialActive ? 'text-yellow-400' : 'text-blue-500'}`} />
              <div>
                <p className="text-xl font-semibold">{currentPlan}</p>
                {isTrialActive && (
                  <p className="text-sm text-yellow-400">{daysRemaining} days remaining</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-400 flex-grow">
              {isTrialActive
                ? 'Enjoy full access to all Turbinix features during your trial.'
                : 'You have full access to Turbinix Pro features.'}
            </p>
            <button
              disabled
              className="w-full mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            >
              Manage Subscription (Coming Soon)
            </button>
          </motion.div>

          {/* Upgrade Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-700 flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-4">Turbinix Pro</h2>
            <p className="text-4xl font-bold mb-1">$5 <span className="text-base font-normal text-gray-400">/ month</span></p>
            <p className="text-sm text-gray-400 mb-6">Billed monthly after your free trial ends.</p>

            <ul className="text-sm space-y-2 text-gray-300 mb-6 flex-grow">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Accounts</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Advanced Budgeting Tools</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Reports & Insights</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Priority Support</li>
            </ul>

            <button
              disabled
              className="w-full mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-900"
            >
              Upgrade Now (Coming Soon)
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Billing;
