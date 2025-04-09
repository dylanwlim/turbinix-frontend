import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Hub() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="p-4">
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded float-right hover:bg-red-600"
      >
        Logout
      </button>

      {/* rest of your hub content */}
    </div>
  );
}

function ProjectHub() {
  const projects = [
    {
      name: 'Finance Dashboard',
      path: '/finance',
      description: 'Track your properties and bank accounts in one place.',
    },
    {
      name: 'Real Estate Tools (Coming Soon)',
      path: '/real-estate',
      description: 'Analyze properties, value forecasts, and ownership info.',
    },
    {
      name: 'Document Vault (Coming Soon)',
      path: '/documents',
      description: 'Securely upload and access investment documents.',
    },
    {
      name: 'Budgeting Tool (New)',
      path: '/budget', // ✅ UPDATED PATH
      description: 'Manage income, expenses, and see where your money goes.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Turbinix Project Hub</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <Link
            to={project.path}
            key={idx}
            className="bg-white dark:bg-gray-800 border rounded-xl p-5 shadow hover:shadow-lg transition transform hover:-translate-y-1"
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
