import React, { useState } from 'react';

function UpdatesHelp() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("📬 Message sent to Dylan:", message); // Future: send to backend
    setSent(true);
    setMessage('');
    setTimeout(() => setSent(false), 3000);
  };

  const updates = [
    "🏢 Business Version of Turbinix launching this summer",
    "📊 Real-time charts for value change coming soon",
    "🔗 Automatic bank & property value linking in R&D",
    "📂 Document preview and version control planned",
    "💡 AI spending suggestions based on category habits",
  ];

  const faqs = [
    {
      question: "How is my data stored?",
      answer: "All your entries are saved locally or securely in your account. In production, data will be encrypted in a private database.",
    },
    {
      question: "Will Turbinix always be free?",
      answer: "The basic version will remain free. A premium tier is planned for additional automation features.",
    },
    {
      question: "Can I track investments?",
      answer: "Yes! Use the 'Securities' category to add investment accounts like Roth IRA or brokerage accounts.",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Updates & Help Center</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Updates */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-2 border">
          <h2 className="text-xl font-semibold mb-2">📢 Upcoming Features</h2>
          <ul className="list-disc list-inside space-y-1">
            {updates.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-2 border">
          <h2 className="text-xl font-semibold mb-2">❓ FAQ</h2>
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <p className="font-semibold">{faq.question}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message Dylan */}
      <div className="mt-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-2">📬 Message the Founder</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write your message or feedback here..."
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <button
          onClick={handleSend}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Message
        </button>
        {sent && <p className="text-green-500 text-sm mt-2">Message sent successfully!</p>}
      </div>
    </div>
  );
}

export default UpdatesHelp;
