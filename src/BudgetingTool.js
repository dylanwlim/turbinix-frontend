import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';

function BudgetingTool() {
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    frequency: 'monthly',
  });
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('budgetEntries');
    return saved ? JSON.parse(saved) : [];
  });
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem('budgetPreference') || 'moderate';
  });

  useEffect(() => {
    localStorage.setItem('budgetEntries', JSON.stringify(entries));
    localStorage.setItem('budgetPreference', preference);
  }, [entries, preference]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.category || !form.description || !form.amount || !form.frequency) return;

    const newEntry = {
      ...form,
      amount: parseFloat(form.amount),
    };

    setEntries([...entries, newEntry]);
    setForm({ category: '', description: '', amount: '', frequency: 'monthly' });
  };

  const handleDelete = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const incomeEntries = entries.filter(e => e.amount > 0);
  const expenseEntries = entries.filter(e => e.amount < 0);

  const normalize = (amount, freq) => {
    const multiplier = {
      daily: 30,
      weekly: 4,
      biweekly: 2,
      monthly: 1,
      yearly: 1 / 12,
    };
    return amount * (multiplier[freq] || 1);
  };

  const totalIncome = incomeEntries.reduce((sum, e) => sum + normalize(e.amount, e.frequency), 0);
  const totalExpenses = expenseEntries.reduce((sum, e) => sum + normalize(e.amount, e.frequency), 0);
  const net = totalIncome + totalExpenses;

  const chartData = Object.entries(
    entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + normalize(entry.amount, entry.frequency);
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount }));

  const spendingTiers = {
    light: 0.5,
    moderate: 0.7,
    aggressive: 0.85,
  };

  const tier = spendingTiers[preference] || 0.7;
  const maxSpend = Math.max(0, totalIncome * tier + totalExpenses); // expenses are negative
  const perDay = maxSpend / 30;
  const perWeek = maxSpend / 4;
  const perMonth = maxSpend;

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Budgeting Tool</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 border rounded-xl p-4 shadow space-y-2">
          <p><strong>💵 Total Income (monthly normalized):</strong> ${totalIncome.toLocaleString()}</p>
          <p><strong>💸 Total Expenses (monthly normalized):</strong> ${Math.abs(totalExpenses).toLocaleString()}</p>
          <p><strong>🧮 Net Balance:</strong> ${net.toLocaleString()}</p>

          <div className="mt-4">
            <label className="block font-semibold mb-1">Saving Preference:</label>
            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-900"
            >
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <div className="mt-4">
            <p><strong>📆 Forecasted Safe Spending:</strong></p>
            <p>🗓️ Daily: ${perDay.toFixed(2)}</p>
            <p>📅 Weekly: ${perWeek.toFixed(2)}</p>
            <p>🗓️ Monthly: ${perMonth.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 shadow">
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
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div className="grid md:grid-cols-2 gap-4">
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
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount (positive = income, negative = expense)"
            className="w-full p-2 border rounded bg-white dark:bg-gray-900"
          />
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition transform hover:scale-105"
        >
          ➕ Add Entry
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
            <p><strong>🔁 Frequency:</strong> {entry.frequency}</p>
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
