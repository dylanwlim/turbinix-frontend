import React, { useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'https://turbinix-backend.onrender.com';

function RealEstateLookup() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    try {
      const res = await fetch(`${API}/api/property-value?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      setResult(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch property data.');
      setResult(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Mock Property Lookup</h1>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter property address (e.g. 123 Main St)"
        className="w-full p-2 mb-4 border rounded bg-white dark:bg-gray-900"
      />
      <button
        onClick={handleLookup}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Lookup
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 bg-white dark:bg-gray-800 border rounded-xl p-4 shadow">
          <p><strong>🏠 Estimated Value:</strong> ${result.value.toLocaleString()}</p>
          <p><strong>📈 Change:</strong> {result.change}</p>
          <img
            src={result.image}
            alt="Property"
            className="mt-4 rounded shadow max-h-72 object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default RealEstateLookup;
