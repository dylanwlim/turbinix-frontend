import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function RealEstate() {
  const [form, setForm] = useState({
    address: '',
    propertyValue: '',
    monthlyRent: '',
    expenses: '',
  });

  const [analysis, setAnalysis] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAnalyze = (e) => {
    e.preventDefault();
    const value = parseFloat(form.propertyValue);
    const rent = parseFloat(form.monthlyRent);
    const expenses = parseFloat(form.expenses);

    if (!value || !rent || !expenses) return;

    const yearlyRent = rent * 12;
    const yearlyExpenses = expenses * 12;
    const netIncome = yearlyRent - yearlyExpenses;
    const capRate = ((netIncome / value) * 100).toFixed(2);

    setAnalysis({
      netIncome,
      capRate,
      yearlyRent,
      yearlyExpenses,
    });
  };

  const chartData = analysis ? [
    { name: 'Income', amount: analysis.yearlyRent },
    { name: 'Expenses', amount: analysis.yearlyExpenses },
    { name: 'Net', amount: analysis.netIncome },
  ] : [];

  return (
    <div className="max-w-3xl mx-auto p-6 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">🏡 Real Estate Analyzer</h1>

      <form onSubmit={handleAnalyze} className="grid gap-4 mb-6">
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Property Address"
          className="p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="number"
          name="propertyValue"
          value={form.propertyValue}
          onChange={handleChange}
          placeholder="Property Value ($)"
          className="p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="number"
          name="monthlyRent"
          value={form.monthlyRent}
          onChange={handleChange}
          placeholder="Monthly Rent ($)"
          className="p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="number"
          name="expenses"
          value={form.expenses}
          onChange={handleChange}
          placeholder="Monthly Expenses ($)"
          className="p-2 border rounded bg-white dark:bg-gray-900"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Analyze
        </button>
      </form>

      {analysis && (
        <div className="space-y-4">
          <p><strong>Address:</strong> {form.address}</p>
          <p><strong>Net Annual Income:</strong> ${analysis.netIncome.toLocaleString()}</p>
          <p><strong>Cap Rate:</strong> {analysis.capRate}%</p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default RealEstate;
