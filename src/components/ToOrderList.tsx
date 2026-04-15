'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ToOrderItem {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'kobra_to_order_items';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadItems(): ToOrderItem[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load to-order items:', e);
    }
  }
  return [];
}

export default function ToOrderList() {
  const [items, setItems] = useState<ToOrderItem[]>(loadItems);
  const [newItemText, setNewItemText] = useState('');

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    const text = newItemText.trim();
    if (!text) return;
    setItems(prev => [...prev, { id: generateId(), text, completed: false }]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItemText = (id: string, text: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, text } : item
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const pendingItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  const clearCompleted = () => {
    setItems(prev => prev.filter(item => !item.completed));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">To Order</h1>
        <p className="text-sm text-gray-400 mt-1">
          {pendingItems.length} pending &middot; {completedItems.length} completed
        </p>
      </div>

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add item to order list..."
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          onClick={addItem}
          disabled={!newItemText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Pending items */}
      {pendingItems.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</h2>
          <div className="space-y-1">
            {pendingItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors group"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  className="flex-1 bg-transparent text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded transition-all"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed items */}
      {completedItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</h2>
            <button
              onClick={clearCompleted}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1">
            {completedItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3 bg-gray-900/20 border border-gray-800/50 rounded-lg group"
              >
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => toggleItem(item.id)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 cursor-pointer flex-shrink-0"
                />
                <span className="flex-1 text-gray-500 text-sm line-through">{item.text}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded transition-all"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No items yet</p>
          <p className="text-sm mt-1">Add items you need to order above</p>
        </div>
      )}
    </div>
  );
}
