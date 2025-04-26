// src/TransactionIncomeModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define default categories - you might want to manage this globally later
const defaultCategories = [
  'Groceries', 'Utilities', 'Rent/Mortgage', 'Transportation', 'Dining Out',
  'Entertainment', 'Shopping', 'Health', 'Subscriptions', 'Salary', 'Freelance', 'Other'
];

function TransactionIncomeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null, // Pass data for editing later if needed
  modalType = 'transaction', // 'transaction' or 'income'
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]); // Default to today
  const [category, setCategory] = useState(modalType === 'income' ? 'Salary' : 'Groceries'); // Sensible defaults
  const [isRecurring, setIsRecurring] = useState(false); // Simple toggle for now
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
        // Reset form when opened, prefill if editing later
        if (initialData) {
            // Logic for editing (prefill form) - implement later if needed
            setTitle(initialData.title || '');
            setAmount(Math.abs(initialData.amount) || ''); // Use absolute value for input
            setDate(initialData.date || new Date().toISOString().split('T')[0]);
            setCategory(initialData.category || (modalType === 'income' ? 'Salary' : 'Groceries'));
            setIsRecurring(initialData.isRecurring || false);
        } else {
            setTitle('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategory(modalType === 'income' ? 'Salary' : 'Groceries');
            setIsRecurring(false);
        }
        setFormError('');
    }
  }, [isOpen, initialData, modalType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous errors

    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0 || !date || !category) {
        setFormError('Please fill in all fields with valid values.');
      return;
    }

    // Determine if it's an expense (-) or income (+)
    const finalAmount = modalType === 'transaction' ? -numericAmount : numericAmount;

    const submittedData = {
      id: initialData?.id || Date.now(), // Use existing ID if editing, generate new if adding
      title: title.trim(),
      amount: finalAmount,
      date: date, // Store as YYYY-MM-DD string
      category: category,
      isRecurring: isRecurring,
      // Add frequency/nextDate fields if isRecurring is true later
    };
    onSubmit(submittedData, modalType); // Pass type back
    onClose(); // Close modal after submit
  };

  if (!isOpen) return null;

  const dialogTitle = modalType === 'transaction' ? 'Add Transaction' : 'Add Income';
  const amountLabel = modalType === 'transaction' ? 'Expense Amount ($)' : 'Income Amount ($)';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 text-white rounded-2xl w-full max-w-lg shadow-xl p-6 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-5">
             <h2 className="text-xl font-semibold">{dialogTitle}</h2>
            <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-white transition-colors"
            aria-label="Close modal"
            >
            &times;
            </button>
        </div>


        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-400 mb-1">
              Title
            </label>
            <input
              type="text"
              id="itemTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={modalType === 'transaction' ? 'e.g., Dinner with friends' : 'e.g., Monthly Salary'}
              required
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
            />
          </div>

           {/* Amount */}
          <div>
            <label htmlFor="itemAmount" className="block text-sm font-medium text-gray-400 mb-1">
              {amountLabel}
            </label>
            <input
              type="number"
              id="itemAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              min="0.01" // Must be positive input
              step="0.01"
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="itemDate" className="block text-sm font-medium text-gray-400 mb-1">
              Date
            </label>
            <input
              type="date"
              id="itemDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-500 appearance-none"
               // Style date input appearance if needed
              style={{ colorScheme: 'dark' }} // Helps with calendar color in dark mode
            />
          </div>

          {/* Category */}
          <div>
             <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-400 mb-1">
                Category
             </label>
             <select
                id="itemCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 px-3 py-2 text-sm bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
             >
                {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
             </select>
          </div>

           {/* Recurring Toggle */}
           <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-gray-400">Mark as Recurring?</span>
                <label htmlFor="isRecurringToggle" className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="isRecurringToggle"
                        className="sr-only peer"
                        checked={isRecurring}
                        onChange={() => setIsRecurring(!isRecurring)}
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
            </div>
            {/* TODO: Add frequency dropdown if isRecurring is true */}


            {/* Error Message */}
            {formError && (
                <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>
            )}


          {/* Action Buttons */}
          <div className="flex justify-end items-center pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            >
              {initialData ? 'Save Changes' : (modalType === 'transaction' ? 'Add Expense' : 'Add Income')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default TransactionIncomeModal;