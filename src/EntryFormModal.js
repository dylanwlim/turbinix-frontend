// src/EntryFormModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function EntryFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete, // Added for delete functionality
  mode = 'add', // 'add' or 'edit'
  categoryType, // 'assets' or 'liabilities'
  categoryName,
  itemData = null, // Data for editing
}) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [lastUpdated, setLastUpdated] = useState(''); // Keep track of original update time for edits

  useEffect(() => {
    if (mode === 'edit' && itemData) {
      setName(itemData.name || '');
      setValue(itemData.value || '');
      setLastUpdated(itemData.lastUpdated); // Store original timestamp
    } else {
      // Reset form for 'add' mode or if no itemData
      setName('');
      setValue('');
      setLastUpdated('');
    }
  }, [isOpen, mode, itemData]); // Rerun effect when modal opens or mode/item changes

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!name || isNaN(numericValue) || numericValue < 0) {
      // Basic validation
      alert('Please enter a valid name and non-negative value.');
      return;
    }

    const submittedData = {
      id: mode === 'edit' ? itemData.id : Date.now(), // Use existing ID if editing, generate new if adding
      name: name.trim(),
      value: numericValue,
      // Update timestamp only if adding, or keep original if editing (or update if needed)
      lastUpdated: mode === 'add' ? new Date().toISOString() : lastUpdated || new Date().toISOString(),
    };
    onSubmit(categoryType, categoryName, submittedData);
    onClose(); // Close modal after submit
  };

  const handleDeleteClick = () => {
      if (mode === 'edit' && itemData && window.confirm(`Are you sure you want to delete "${itemData.name}"?`)) {
          onDelete(categoryType, categoryName, itemData.id);
          onClose(); // Close modal after delete
      }
  }

  if (!isOpen) return null;

  const title = mode === 'add' ? `Add to ${categoryName}` : `Edit ${itemData?.name || 'Item'}`;
  const buttonLabel = mode === 'add' ? 'Add Item' : 'Save Changes';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl p-6 relative border border-zinc-200 dark:border-zinc-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold mb-5 text-zinc-800 dark:text-zinc-100">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Item Name
            </label>
            <input
              type="text"
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={categoryName === 'Real Estate' ? 'e.g., 456 Oak Ave' : categoryName === 'Loans' ? 'e.g., Federal Student Loan' : 'Item Name'}
              required
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="itemValue" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Value ($)
            </label>
            <input
              type="number"
              id="itemValue"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 15000"
              required
              min="0"
              step="0.01" // Allow decimals
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Optional: Add more fields here like image URL, interest rate for loans, etc. */}

          <div className="flex justify-between items-center pt-4">
             {mode === 'edit' && (
                <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                    Delete
                </button>
             )}
             <div className="flex-grow"></div> {/* Spacer */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-sky-600 dark:hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 dark:focus:ring-sky-500"
            >
              {buttonLabel}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default EntryFormModal;