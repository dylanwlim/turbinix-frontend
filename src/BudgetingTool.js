import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

function BudgetingTool() {
  const [form, setForm] = useState({ category: '', description: '', amount: '' });
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('budgetEntries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('budgetEntries', JSON.stringify(entries));
  }, [entries]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount) return;

    const newEntry = {
      ...form,
      amount: parseFloat(form.amount),
    };

    setEntries([...entries, newEntry]);
    setForm({ category: '', description: '', amount: '' });
  };

  const handleDelete = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const income = entries
    .filter((e) => e.amount > 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const expenses = entries
    .filter((e) => e.amount < 0)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const net = income + expenses;

  const chartData = Object.entries(
    entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount }));

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Budgeting Tool</h1>

      <div className="bg-gray-100 dark:bg-gray-800 border rounded-xl p-4 mb-8 shadow">
        <p><strong>💵 Total Income:</strong> ${income.toLocaleString()}</p>
        <p><strong>💸 Total Expenses:</strong> ${Math.abs(expenses).toLocaleString()}</p>
        <p><strong>🧮 Net Balance:</strong> ${net.toLocaleString()}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 mb-8 shadow">
        <h2 className="text-xl font-semibold mb-2">Spending by Category</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="category" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip />
            <Bar dataKey="amount" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category (e.g., Rent, Groceries)"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount (positive = income, negative = expense)"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition transform hover:scale-105"
        >
          Add Entry
        </button>
      </form>

      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="border rounded p-4 shadow bg-white dark:bg-gray-800 relative transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute top-2 right-2">
              <button
                onClick={() => handleDelete(idx)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                🗑️ Delete
              </button>
            </div>
            <p><strong>📁 Category:</strong> {entry.category}</p>
            <p><strong>📝 Description:</strong> {entry.description}</p>
            <p>
              <strong>💰 Amount:</strong>{' '}
              <span className={entry.amount >= 0 ? 'text-green-600' : 'text-red-500'}>
                ${entry.amount.toLocaleString()}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BudgetingTool;
