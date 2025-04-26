// src/CategoryDetailsPanel.js
import React, { useState, useEffect } from 'react';

function CategoryDetailsPanel({ category, items, timeRange, userData, setUserData }) {
  const [newItem, setNewItem] = useState({ name: '', value: '' });

  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  // Save to localStorage after any userData update
  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);

  const handleAdd = () => {
    if (!newItem.name.trim() || !newItem.value.trim()) return;

    const isAsset = userData.assets[category] !== undefined;
    const newEntry = {
      id: Date.now(),
      name: newItem.name.trim(),
      value: parseFloat(newItem.value),
    };

    const updated = { ...userData };
    if (isAsset) {
      updated.assets[category] = [...(updated.assets[category] || []), newEntry];
    } else {
      updated.liabilities[category] = [...(updated.liabilities[category] || []), newEntry];
    }

    setUserData(updated);
    setNewItem({ name: '', value: '' });
  };

  const handleDelete = (id) => {
    const isAsset = userData.assets[category] !== undefined;
    const list = isAsset ? userData.assets[category] : userData.liabilities[category];
    const filtered = list.filter(i => i.id !== id);

    const updated = { ...userData };
    if (isAsset) {
      updated.assets[category] = filtered;
    } else {
      updated.liabilities[category] = filtered;
    }

    setUserData(updated);
  };

  const isAddDisabled = !newItem.name.trim() || !newItem.value.trim();

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gray-300 dark:divide-gray-700">
        {items.map((item) => (
          <li key={item.id} className="py-3 flex justify-between items-center">
            <span className="font-medium text-black dark:text-white">{item.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-green-600 dark:text-green-400 font-medium">
                ${item.value.toLocaleString()}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-sm text-red-500 hover:underline transition"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-gray-300 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">Add New</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleChange}
            placeholder="Name"
            className="flex-1 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white"
          />
          <input
            type="number"
            name="value"
            value={newItem.value}
            onChange={handleChange}
            placeholder="Value"
            className="w-32 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-black dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={isAddDisabled}
            className={`px-4 py-2 rounded-md text-white transition ${
              isAddDisabled
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryDetailsPanel;
