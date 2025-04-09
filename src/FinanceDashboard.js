import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

function FinanceDashboard() {
  const [form, setForm] = useState({ property: '', bank: '', balance: '' });
  const [entries, setEntries] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = '/login';
    } else {
      setUsername(user);
      fetch(`${import.meta.env.VITE_API_URL}/api/entries/${user}`)
        .then(res => res.json())
        .then(data => setEntries(data))
        .catch(err => console.error("Failed to fetch entries:", err));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.property || !form.bank || !form.balance) return;

    const data = {
      ...form,
      balance: parseFloat(form.balance)
    };

    if (editingIndex !== null) {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/${username}/${editingIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = [...entries];
        updated[editingIndex] = data;
        setEntries(updated);
        setEditingIndex(null);
        setForm({ property: '', bank: '', balance: '' });
      }
    } else {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newEntry = { ...data };
        setEntries([...entries, newEntry]);
        setForm({ property: '', bank: '', balance: '' });
      }
    }
  };

  const handleDelete = async (index) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/entries/${username}/${index}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      const updated = [...entries];
      updated.splice(index, 1);
      setEntries(updated);
    }
  };

  const handleEdit = (index) => {
    setForm(entries[index]);
    setEditingIndex(index);
  };

  const totalProperties = entries.length;
  const totalBalance = entries.reduce(
    (acc, curr) => acc + parseFloat(curr.balance || 0),
    0
  );
  const avgBalance = totalProperties > 0 ? totalBalance / totalProperties : 0;

  const chartData = entries.map((entry, idx) => ({
    name: entry.property || `Property ${idx + 1}`,
    balance: parseFloat(entry.balance || 0),
  }));

  return (
    <div className="p-6 max-w-3xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Finance Dashboard</h1>

      <div className="bg-gray-100 dark:bg-gray-800 border rounded-xl p-4 mb-8 shadow">
        <p><strong>Total Properties:</strong> {totalProperties}</p>
        <p><strong>Total Balance:</strong> ${totalBalance.toLocaleString()}</p>
        <p><strong>Avg. Balance:</strong> ${avgBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border rounded-xl p-4 mb-8 shadow">
        <h2 className="text-xl font-semibold mb-2">Balance by Property</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis stroke="#8884d8" />
            <Tooltip />
            <Bar dataKey="balance" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          name="property"
          value={form.property}
          onChange={handleChange}
          placeholder="Property Address"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="text"
          name="bank"
          value={form.bank}
          onChange={handleChange}
          placeholder="Bank Name"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <input
          type="number"
          name="balance"
          value={form.balance}
          onChange={handleChange}
          placeholder="Account Balance"
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition transform hover:scale-105"
        >
          {editingIndex !== null ? 'Update Entry' : 'Add Entry'}
        </button>
      </form>

      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div
            key={idx}
            className="border rounded p-4 shadow bg-white dark:bg-gray-800 relative transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleEdit(idx)}
                className="text-yellow-600 hover:text-yellow-800 text-sm"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(idx)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                🗑️ Delete
              </button>
            </div>
            <p><strong>🏠 Property:</strong> {entry.property}</p>
            <p><strong>🏦 Bank:</strong> {entry.bank}</p>
            <p><strong>💰 Balance:</strong> ${Number(entry.balance).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FinanceDashboard;
