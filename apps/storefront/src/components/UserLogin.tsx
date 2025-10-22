import React, { useState } from 'react';
import { api, type Customer } from '../lib/api';

interface UserLoginProps {
  onLogin: (customer: Customer) => void;
  onCancel: () => void;
}

export const UserLogin: React.FC<UserLoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const customer = await api.getCustomerByEmail(email);
      onLogin(customer);
    } catch (err) {
      setError('Customer not found. Please check your email address.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-4">Welcome to ShopLite</h2>
        <p className="text-gray-600 mb-6">
          Please enter your email address to continue shopping.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Demo users available:</p>
          <ul className="space-y-1">
            <li>• demo@example.com</li>
            <li>• sarah.j@example.com</li>
            <li>• michael.chen@example.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
