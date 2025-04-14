import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryDetailsPanel from './CategoryDetailsPanel';

function FinanceDashboard() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [userData, setUserData] = useState({
    netWorth: 243500,
    assets: {
      realEstate: [
        {
          id: 1,
          name: '123 Main St',
          value: 420000,
          image: 'https://source.unsplash.com/featured/400x200?house',
          changes: { day: 0.1, week: 0.5, month: 1.2, year: 8.5 }
        }
      ],
      savings: [
        {
          id: 1,
          name: 'Emergency Fund',
          value: 15000,
          institution: 'Chase',
          changes: { day: 0, week: 0.1, month: 0.2, year: 2.1 }
        },
        {
          id: 2,
          name: 'Vacation Fund',
          value: 5000,
          institution: 'Ally',
          changes: { day: 0, week: 0.1, month: 0.2, year: 2.0 }
        }
      ],
      checking: [
        {
          id: 1,
          name: 'Primary Checking',
          value: 3500,
          institution: 'Chase',
          changes: { day: -0.5, week: -2.3, month: 5.2, year: 12.4 }
        }
      ],
      securities: [
        {
          id: 1,
          name: 'Roth IRA',
          value: 42000,
          institution: 'Vanguard',
          changes: { day: 1.2, week: -0.8, month: 2.5, year: 15.6 }
        },
        {
          id: 2,
          name: '401(k)',
          value: 85000,
          institution: 'Fidelity',
          changes: { day: 0.9, week: -1.1, month: 1.8, year: 12.3 }
        }
      ]
    },
    liabilities: {
      loans: [
        {
          id: 1,
          name: 'Student Loan',
          value: 15000,
          interestRate: 4.5,
          changes: { day: 0, week: -0.2, month: -0.8, year: -8.5 }
        },
        {
          id: 2,
          name: 'Car Loan',
          value: 12000,
          interestRate: 3.2,
          changes: { day: 0, week: -0.5, month: -1.5, year: -15.6 }
        }
      ]
    }
  });

  const generateChartData = () => {
    const data = [];

    Object.entries(userData.assets).forEach(([key, items]) => {
      if (items.length > 0) {
        const totalValue = items.reduce((sum, item) => sum + item.value, 0);
        if (totalValue > 0) {
          data.push({
            name: key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
            value: totalValue,
            type: 'asset'
          });
        }
      }
    });

    Object.entries(userData.liabilities).forEach(([key, items]) => {
      if (items.length > 0) {
        const totalValue = items.reduce((sum, item) => sum + item.value, 0);
        if (totalValue > 0) {
          data.push({
            name: key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
            value: totalValue,
            type: 'liability'
          });
        }
      }
    });

    return data;
  };

  const chartData = generateChartData();
  const assetTotal = Object.values(userData.assets).reduce((sum, category) => sum + category.reduce((catSum, item) => catSum + item.value, 0), 0);
  const liabilityTotal = Object.values(userData.liabilities).reduce((sum, category) => sum + category.reduce((catSum, item) => catSum + item.value, 0), 0);

  const getCategoryItems = () => {
    if (!selectedCategory) return [];
    const category = selectedCategory.toLowerCase().replace(/\s/g, '');

    for (const [key, items] of Object.entries(userData.assets)) {
      if (key.toLowerCase() === category) return items;
    }
    for (const [key, items] of Object.entries(userData.liabilities)) {
      if (key.toLowerCase() === category) return items;
    }
    return [];
  };

  const categoryItems = getCategoryItems();
  const getChangeValue = (item) => item.changes ? item.changes[timeRange] : 0;
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
  const formatPercentage = (val) => new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(val / 100);

  const ASSET_COLORS = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'];
  const LIABILITY_COLORS = ['#F44336', '#FF5722', '#FF9800', '#FFC107'];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Financial Dashboard</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold">Net Worth</h2>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(assetTotal - liabilityTotal)}
                </p>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      onClick={(data) => setSelectedCategory(data.name)}
                      cursor="pointer"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.type === 'asset' ? ASSET_COLORS[index % ASSET_COLORS.length] : LIABILITY_COLORS[index % LIABILITY_COLORS.length]}
                          stroke={selectedCategory === entry.name ? '#000' : '#fff'}
                          strokeWidth={selectedCategory === entry.name ? 2 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>Click on a category to view details</p>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || 'overview'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5 }}
              >
                {selectedCategory ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-bold">{selectedCategory}</h2>
                      <button onClick={() => setSelectedCategory(null)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        ← Back
                      </button>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {['day', 'week', 'month', 'year'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimeRange(period)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            timeRange === period ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>

                    <CategoryDetailsPanel category={selectedCategory} items={categoryItems} timeRange={timeRange} />
                  </div>
                ) : (
                  <div className="grid gap-6">
                    <motion.div layout className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow">
                      <h3 className="text-xl font-semibold mb-2">Total Assets</h3>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(assetTotal)}</p>
                    </motion.div>
                    <motion.div layout className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow">
                      <h3 className="text-xl font-semibold mb-2">Total Liabilities</h3>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(liabilityTotal)}</p>
                    </motion.div>
                    <motion.div layout className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow">
                      <h3 className="text-xl font-semibold mb-2">Net Worth</h3>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(assetTotal - liabilityTotal)}</p>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;