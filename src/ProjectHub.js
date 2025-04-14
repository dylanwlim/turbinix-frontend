import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ProjectHub() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [financeCount, setFinanceCount] = useState(0);
  const [budgetCount, setBudgetCount] = useState(0);
  const [docCount, setDocCount] = useState(0);

  useEffect(() => {
    const fullName = localStorage.getItem('fullName');
    setFirstName(fullName ? fullName.split(' ')[0] : 'User');

    const entries = JSON.parse(localStorage.getItem('financeEntries') || '[]');
    setFinanceCount(entries.length);

    const budgets = JSON.parse(localStorage.getItem('budgetEntries') || '[]');
    setBudgetCount(budgets.length);

    const docs = JSON.parse(localStorage.getItem('documents') || '[]');
    setDocCount(docs.length);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('user_info');
    localStorage.removeItem('fullName');
    navigate('/');
  };

  const projects = [
    {
      name: 'Finance Dashboard',
      path: '/finance',
      description: 'Track your net worth with categorized accounts and pie chart breakdowns.',
    },
    {
      name: 'Budgeting Tool',
      path: '/budget',
      description: 'Manage your income and expenses and view smart breakdowns by category.',
    },
    {
      name: 'Real Estate Tools',
      path: '/real-estate',
      description: 'Get mock property valuations, trends, and property image previews.',
    },
    {
      name: 'Document Vault',
      path: '/documents',
      description: 'Securely upload and manage your financial documents in one place.',
    },
    {
      name: 'Updates & Help',
      path: '/updates',
      description: 'See upcoming features and send feedback directly to Dylan.',
    },
  ];

  const greeting = () => {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    if (day === 0 || day === 6) return `Happy weekend, ${firstName}`;
    if (hour < 12) return `Good morning, ${firstName}`;
    if (hour < 18) return `Good afternoon, ${firstName}`;
    return `Good evening, ${firstName}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{greeting()}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      <div className="mb-10 bg-white dark:bg-gray-800 p-4 rounded-xl shadow border text-sm">
        <p><strong>📊 Finance Entries:</strong> {financeCount}</p>
        <p><strong>💼 Budget Items:</strong> {budgetCount}</p>
        <p><strong>📁 Uploaded Documents:</strong> {docCount}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <Link
            key={idx}
            to={project.path}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectHub;
