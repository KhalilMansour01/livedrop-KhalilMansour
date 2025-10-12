import React, { useState } from 'react';
import { Button } from '../atoms/button';
import { Input } from '../atoms/input';
import { supportEngine } from '../../assistant/engine';

interface SupportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportPanel: React.FC<SupportPanelProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await supportEngine.processQuery(query);
      setResponse(result.answer);
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 max-w-full bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <h2 className="text-lg font-semibold">Ask Support</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {response && (
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-700">{response}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="support-query" className="block text-sm font-medium text-gray-700 mb-2">
                  How can I help you?
                </label>
                <Input
                  id="support-query"
                  value={query}
                  onChange={setQuery}
                  placeholder="Ask about orders, returns, shipping..."
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !query.trim()}
                className="w-full"
              >
                {isLoading ? 'Thinking...' : 'Ask Support'}
              </Button>
            </form>

            {/* Help text */}
            <div className="mt-6 text-xs text-gray-500">
              <p>I can help with:</p>
              <ul className="mt-2 space-y-1">
                <li>• Order status (provide order ID)</li>
                <li>• Returns & shipping policies</li>
                <li>• Payment questions</li>
                <li>• General store policies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};