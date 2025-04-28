// src/UpdatesHelp.js
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, Sparkles, HelpCircle, MessageSquare, Loader, CheckCircle, AlertCircle } from 'lucide-react';

// Mock API URL (Replace with actual if available)
const API_URL = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

// --- Data ---
const upcomingFeatures = [
  {
    title: "Tax Center",
    description: "Centralize tax forms, track estimated payments, and prepare for filing season seamlessly.",
    icon: <Sparkles size={20} className="text-purple-500 dark:text-purple-400" />
  },
  {
    title: "AI Sidekick Bot",
    description: "Ask natural language questions about your finances and get instant insights.",
    icon: <MessageSquare size={20} className="text-blue-500 dark:text-sky-400" />
  },
  {
    title: "File-to-Tax Conversion",
    description: "Automatically extract key data from uploaded tax documents like W-2s and 1099s.",
     icon: <Sparkles size={20} className="text-green-500 dark:text-green-400" />
  },
  {
    title: "Business Finance Center",
    description: "Dedicated tools for small business owners to track income, expenses, and profitability.",
     icon: <Sparkles size={20} className="text-indigo-500 dark:text-indigo-400" />
  },
  {
    title: "Plaid Integration",
    description: "Securely connect your bank accounts for automatic transaction importing and balance updates.",
     icon: <Sparkles size={20} className="text-pink-500 dark:text-pink-400" />
  },
  {
    title: "Investment Data Automation",
    description: "Track investment performance and holdings automatically through linked accounts.",
     icon: <Sparkles size={20} className="text-amber-500 dark:text-amber-400" />
  },
   {
    title: "Personalized Recommendations",
    description: "Receive tailored suggestions for budgeting, saving, and investment strategies.",
     icon: <Sparkles size={20} className="text-cyan-500 dark:text-cyan-400" />
  },
];

const faqs = [
  {
    question: "How secure is Turbinix?",
    answer: "Security is our top priority. Data stored locally remains on your device. For account features, we use industry-standard encryption (like bcrypt for passwords) and secure connections (HTTPS). We will never sell your data.",
  },
  {
    question: "Can I connect my bank accounts?",
    answer: "Direct bank connection via Plaid integration is a high-priority feature currently under development. This will allow for automatic transaction imports and real-time balance updates.",
  },
  {
    question: "When will new features launch?",
    answer: "We're working hard on the features listed above! While we don't have exact timelines for each, expect major updates throughout the summer and fall. Keep an eye on this section!",
  },
  {
    question: "How can I reset my password?",
    answer: "You can reset your password by clicking the 'Forgot Password?' link on the Login page. You'll receive an email with instructions and a reset code.",
  },
  {
    question: "How can I report a bug or suggest a feature?",
    answer: "Please use the 'Message Dylan' form below! We appreciate all feedback as it helps us improve Turbinix.",
  },
];

// --- Components ---

const FeatureCard = ({ title, description, icon, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-lg dark:hover:border-sky-700/40 hover:border-blue-400/40 transition-all duration-200 group"
    >
        <div className="flex items-center mb-2">
            <span className="mr-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">{icon}</span>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">{title}</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </motion.div>
);

const AccordionItem = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
        <button
            onClick={onClick}
            className="flex justify-between items-center w-full py-4 px-1 text-left text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors rounded-t-md"
            aria-expanded={isOpen}
        >
            <span>{question}</span>
            <ChevronDown
                size={18}
                className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                        open: { opacity: 1, height: 'auto', marginTop: 0, marginBottom: 16 },
                        collapsed: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden px-1" // Added padding here
                >
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {answer}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const SectionWrapper = ({ title, icon: Icon, children, delay = 0 }) => (
     <motion.section
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: delay }}
         className="mb-12"
     >
        <div className="flex items-center gap-2 mb-5">
            <Icon className="w-6 h-6 text-blue-600 dark:text-sky-500" />
            <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
        </div>
        {children}
    </motion.section>
);


function UpdatesHelp() {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, success, error
  const [submitMessage, setSubmitMessage] = useState('');

  const handleFaqClick = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

   const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
    setSubmitStatus('idle'); // Reset status on change
  };

  const showTemporarySubmitMessage = (status, text) => {
    setSubmitStatus(status);
    setSubmitMessage(text);
    setTimeout(() => {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }, 4000);
  };

  const handleContactSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.message.trim()) {
      showTemporarySubmitMessage('error', 'Please enter your name and message.');
      return;
    }

    setIsSubmitting(true);

     // MOCK API Call - Replace with actual fetch to your backend
    console.log("Submitting feedback:", contactForm);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
    const mockSuccess = Math.random() > 0.2; // Simulate success mostly

    if (mockSuccess) {
        showTemporarySubmitMessage('success', "Thank you for reaching out! I'll get back to you soon.");
        setContactForm({ name: '', email: '', message: '' }); // Clear form
    } else {
        showTemporarySubmitMessage('error', 'Could not send message. Please try again later.');
    }
    // --- End Mock API Call ---

    /* // --- Example Actual Fetch (uncomment and adapt when backend is ready) ---
    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: contactForm.name.trim(),
                email: contactForm.email.trim(), // Optional
                message: contactForm.message.trim(),
                // Add username if user is logged in?
                // username: localStorage.getItem('user') || 'anonymous'
            }),
        });

        if (response.ok) {
             showTemporarySubmitMessage('success', "Thank you for reaching out! I'll get back to you soon.");
             setContactForm({ name: '', email: '', message: '' }); // Clear form
        } else {
            const errorData = await response.json().catch(() => ({})); // Try to parse error
             showTemporarySubmitMessage('error', errorData.error || 'Could not send message. Please try again later.');
        }
    } catch (error) {
        console.error("Contact form submission error:", error);
        showTemporarySubmitMessage('error', 'An error occurred. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
    */
    setIsSubmitting(false); // Also needed for mock

  }, [contactForm]);

  // --- Submit Message Component ---
  const SubmitMessageDisplay = () => {
    if (submitStatus === 'idle') return null;
    const isSuccess = submitStatus === 'success';
    const colorClasses = isSuccess
        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700/50 text-green-800 dark:text-green-300'
        : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/50 text-red-800 dark:text-red-300';
    const Icon = isSuccess ? CheckCircle : AlertCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-md text-sm flex items-center gap-2 border ${colorClasses}`}
        >
            <Icon size={16} className="flex-shrink-0" />
            <span>{submitMessage}</span>
        </motion.div>
    );
};

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-10 pb-20 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.h1
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-3xl sm:text-4xl font-semibold tracking-tight text-center text-zinc-800 dark:text-zinc-100 mb-12"
        >
           Updates & Help Center
        </motion.h1>

        {/* Coming Soon Section */}
         <SectionWrapper title="Coming Soon" icon={Sparkles} delay={0.1}>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {upcomingFeatures.map((feature, index) => (
                    <FeatureCard key={feature.title} {...feature} index={index} />
                 ))}
             </div>
         </SectionWrapper>

        {/* FAQ Section */}
         <SectionWrapper title="Frequently Asked Questions" icon={HelpCircle} delay={0.2}>
             <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6">
                 {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={activeFaqIndex === index}
                        onClick={() => handleFaqClick(index)}
                    />
                 ))}
             </div>
         </SectionWrapper>

        {/* Message Dylan Section */}
         <SectionWrapper title="Message Dylan" icon={MessageSquare} delay={0.3}>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
                    Have a question, bug report, or feature suggestion? Let me know directly!
                </p>
                 <form onSubmit={handleContactSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                              <label htmlFor="contactName" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Your Name</label>
                              <input
                                  type="text"
                                  id="contactName"
                                  name="name"
                                  value={contactForm.name}
                                  onChange={handleContactChange}
                                  placeholder="First Last"
                                  required
                                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition"
                               />
                          </div>
                          <div>
                               <label htmlFor="contactEmail" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Your Email <span className="text-zinc-400 dark:text-zinc-500">(Optional)</span></label>
                               <input
                                  type="email"
                                  id="contactEmail"
                                  name="email"
                                  value={contactForm.email}
                                  onChange={handleContactChange}
                                  placeholder="you@example.com"
                                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition"
                               />
                           </div>
                     </div>
                     <div>
                          <label htmlFor="contactMessage" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Message</label>
                          <textarea
                              id="contactMessage"
                              name="message"
                              rows={4}
                              value={contactForm.message}
                              onChange={handleContactChange}
                              placeholder="Write your message here..."
                              required
                              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none transition resize-vertical"
                          />
                     </div>
                     <div className="flex justify-end pt-2">
                         <button
                             type="submit"
                             disabled={isSubmitting}
                             className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                         >
                            {isSubmitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                         </button>
                     </div>
                     <SubmitMessageDisplay />
                 </form>
            </div>
         </SectionWrapper>

      </div>
    </div>
  );
}

export default UpdatesHelp;