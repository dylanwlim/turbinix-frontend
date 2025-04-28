// src/RecurringItemModal.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// Define default categories - consider managing this globally
const defaultCategories = [
  'Salary', 'Rent/Mortgage', 'Utilities', 'Subscriptions', 'Loan Payment',
  'Insurance', 'Internet', 'Phone Bill', 'Gym', 'Dividends', 'Other Income', 'Other Expense'
];

const frequencies = ['Monthly', 'Weekly', 'Bi-Weekly', 'Annually', 'Quarterly'];

function RecurringItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null, // { id, title, amount, frequency, startDate, category, type }
}) {
  const [type, setType] = useState('expense'); // 'expense' or 'income'
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing mode: Prefill form
        setType(initialData.amount >= 0 ? 'income' : 'expense');
        setTitle(initialData.title || '');
        setAmount(Math.abs(initialData.amount) || '');
        setFrequency(initialData.frequency || 'Monthly');
        setStartDate(initialData.startDate || initialData.date || new Date().toISOString().split('T')[0]); // Use startDate or date
        setCategory(initialData.category || (initialData.amount >= 0 ? 'Salary' : 'Other Expense'));
      } else {
        // Adding mode: Reset form
        setType('expense'); // Default to expense
        setTitle('');
        setAmount('');
        setFrequency('Monthly');
        setStartDate(new Date().toISOString().split('T')[0]);
        setCategory('Subscriptions'); // Default category for recurring expense
      }
      setFormError(''); // Clear errors when opening
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0 || !startDate || !category || !frequency) {
      setFormError('Please fill in all fields with valid values.');
      return;
    }

    const finalAmount = type === 'expense' ? -numericAmount : numericAmount;

    const submittedData = {
      ...(initialData && { id: initialData.id }),
      title: title.trim(),
      amount: finalAmount,
      frequency: frequency,
      startDate: startDate, // Use startDate for recurring items
      // nextDueDate: calculateNextDueDate(startDate, frequency), // Add logic later if needed
      category: category,
      // Type is implicitly handled by the sign of amount, but can be stored if needed
    };

    onSubmit(submittedData, type === 'income' ? 'recurringIncome' : 'recurringExpense'); // Pass type back
    onClose();
  };

  if (!isOpen) return null;

  const dialogTitle = initialData ? 'Edit Recurring Item' : 'Add Recurring Item';
  const submitButtonLabel = initialData ? 'Save Changes' : (type === 'expense' ? 'Add Recurring Expense' : 'Add Recurring Income');

  return (
    // Backdrop
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300">
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-2xl w-full max-w-lg shadow-xl p-6 border border-zinc-200 dark:border-zinc-700 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recurring-modal-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 id="recurring-modal-title" className="text-xl font-semibold">{dialogTitle}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 dark:bg-zinc-800 bg-zinc-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex items-center justify-center space-x-1 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 w-fit mx-auto">
            <button type="button" onClick={() => setType('expense')} className={`px-4 py-1 text-sm font-medium rounded-full transition ${type === 'expense' ? 'bg-white dark:bg-zinc-950 text-red-600 dark:text-red-400 shadow' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Expense</button>
            <button type="button" onClick={() => setType('income')} className={`px-4 py-1 text-sm font-medium rounded-full transition ${type === 'income' ? 'bg-white dark:bg-zinc-950 text-green-600 dark:text-green-400 shadow' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Income</button>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="recurringTitle" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
            <input
              type="text" id="recurringTitle" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'e.g., Netflix Subscription' : 'e.g., Paycheck'} required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="recurringAmount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount ($)</label>
            <input
              type="number" id="recurringAmount" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" required min="0.01" step="0.01"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none placeholder-zinc-400 dark:placeholder-zinc-500"
            />
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="recurringFrequency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Frequency</label>
            <select
              id="recurringFrequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none appearance-none"
            >
              {frequencies.map(freq => <option key={freq} value={freq}>{freq}</option>)}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="recurringStartDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start Date / First Occurrence</label>
            <input
              type="date" id="recurringStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none placeholder-zinc-400 dark:placeholder-zinc-500 appearance-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Category */}
          <div>
             <label htmlFor="recurringCategory" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
             <select
                id="recurringCategory" value={category} onChange={(e) => setCategory(e.target.value)} required
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-sky-500 focus:border-transparent outline-none appearance-none"
             >
                 <option value="" disabled>Select a category</option>
                {defaultCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
          </div>

          {/* Error Message */}
          {formError && (
              <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end items-center pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 dark:focus:ring-offset-zinc-900">Cancel</button>
            <button type="submit" className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${ type === 'income' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500' }`}>{submitButtonLabel}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default RecurringItemModal;