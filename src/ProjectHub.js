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
      description: 'Track your net worth with categorized accounts and pie chart breakdowns.',
    },
    {
      name: '💼 Budgeting Tool',
      path: '/budget',
      description: 'Manage your income and expenses and view smart breakdowns by category.',
    },
    {
      name: '🏠 Real Estate Tools',
      path: '/real-estate',
      description: 'Get mock property valuations, trends, and property image previews.',
    },
    {
      name: '📁 Document Vault',
      path: '/documents',
      description: 'Securely upload and manage your financial documents in one place.',
    },
    {
      name: '🆕 Updates & Help',
      path: '/updates',
      description: 'See upcoming features and send feedback directly to Dylan.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Turbinix Project Hub</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          🚪 Logout
        </button>
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
