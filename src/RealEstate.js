import React, { useState } from 'react';

function RealEstate() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

  const handleSearch = async () => {
    if (!address) return;

    try {
      const res = await fetch(`${API_URL}/api/property-value?address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setResult(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setResult(null);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Real Estate Tools</h1>

      <div className="mb-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter a property address..."
          className="w-full p-2 border rounded bg-white dark:bg-gray-900"
        />
        <button
          onClick={handleSearch}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow mt-4">
          <h2 className="text-xl font-semibold mb-2">Estimated Value: ${Number(result.value).toLocaleString()}</h2>
          <p className="text-sm mb-2">Change: {result.change}</p>
          <img
            src={result.image}
            alt="Property"
            className="rounded-xl w-full max-h-[200px] object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default RealEstate;
