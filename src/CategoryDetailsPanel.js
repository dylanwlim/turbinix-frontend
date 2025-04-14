import React from 'react';

function CategoryDetailsPanel({ category, items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow text-center">
        <p className="text-gray-500 dark:text-gray-400">No items to display for {category}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow">
        <h2 className="text-xl font-bold mb-4">{category} Overview</h2>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-xl flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ${item.value?.toLocaleString() || 'N/A'}
                </span>
              </div>
              {item.institution && (
                <p className="text-sm text-muted-foreground">Institution: {item.institution}</p>
              )}
              {item.interestRate && (
                <p className="text-sm text-muted-foreground">Interest Rate: {item.interestRate}%</p>
              )}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="mt-2 rounded-lg w-full max-h-[150px] object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryDetailsPanel;
