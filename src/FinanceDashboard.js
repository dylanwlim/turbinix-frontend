import React from 'react';

import { Link, useNavigate } from 'react-router-dom';

function ProjectHub() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const projects = [
    {
      name: '📊 Finance Dashboard',
      path: '/finance',
      description: 'View net worth, real estate, loans, and account balances. Interactive charts and detailed breakdowns included.',
    },
    {
      name: '🏠 Real Estate Tools',
      path: '/real-estate',
      description: 'Auto-fill home data, browse mock valuations, and preview property images in real time.',
    },
    {
      name: '🧾 Document Vault',
      path: '/documents',
      description: 'Upload, preview, and download all of your financial documents in one secure place.',
    },
    {
      name: '💡 Budgeting Tool',
      path: '/budget',
      description: 'Track income/expenses by category and time. Includes intelligent recommendations based on saving goals.',
    },
    {
      name: '🆕 Updates & Help Center',
      path: '/updates',
      description: 'See what’s coming next to Turbinix and reach out with feedback or questions.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Welcome to Turbinix Hub</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          🚪 Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, idx) => (
          <Link
            to={project.path}
            key={idx}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold mb-1">{project.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectHub;
