import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProjectHub from './ProjectHub';
import FinanceDashboard from './FinanceDashboard';
import BudgetingTool from './BudgetingTool';
import Home from './Home';
import RealEstate from './RealEstate';
import Documents from './Documents';
import Login from './Login';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const html = document.querySelector('html');
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition duration-300">
        {/* Navigation */}
        <nav className="p-4 shadow flex justify-between items-center bg-gray-100 dark:bg-gray-800">
          <div className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/hub" className="hover:underline">Project Hub</Link>
            <Link to="/finance" className="hover:underline">Finance Dashboard</Link>
            <Link to="/budget" className="hover:underline">Budgeting Tool</Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              {darkMode ? '🌑 Dark Mode' : '☀️ Light Mode'}
            </button>

            {localStorage.getItem('user') ? (
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                🚪 Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hub" element={<ProjectHub />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/budget" element={<BudgetingTool />} />
          <Route path="/real-estate" element={<RealEstate />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
