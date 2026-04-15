'use client';

import { useState, useEffect } from 'react';

interface NoteBox {
  id: number;
  label: string;
  content: string;
}

const DEFAULT_NOTES: NoteBox[] = [
  { id: 1, label: 'Note 1', content: '' },
  { id: 2, label: 'Note 2', content: '' },
  { id: 3, label: 'Note 3', content: '' },
  { id: 4, label: 'Note 4', content: '' },
  { id: 5, label: 'Note 5', content: '' },
];

const STORAGE_KEY = 'kobra_notes';

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteBox[]>(DEFAULT_NOTES);
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 5) {
          setNotes(parsed);
        }
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Auto-save on change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }, 300);
    return () => clearTimeout(timeout);
  }, [notes]);

  const updateNote = (id: number, content: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content } : n))
    );
    setSaved(false);
  };

  const updateLabel = (id: number, label: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, label } : n))
    );
    setSaved(false);
  };

  const clearAll = () => {
    setNotes(DEFAULT_NOTES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTES));
    setSaved(true);
  };

  const saveNow = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Notes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Quick notes • Auto-saved to browser
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-green-400 animate-pulse">✓ Saved</span>
          )}
          <button
            onClick={saveNow}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Save
          </button>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium text-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Notes Grid — 5 horizontal boxes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex flex-col rounded-lg border border-gray-800 bg-gray-900 overflow-hidden"
          >
            {/* Editable label */}
            <input
              type="text"
              value={note.label}
              onChange={(e) => updateLabel(note.id, e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-900 border-b border-gray-800 focus:outline-none focus:text-gray-200"
            />
            {/* Text area */}
            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, e.target.value)}
              placeholder="Type a note..."
              className="flex-1 min-h-[200px] p-3 text-sm text-gray-200 bg-gray-900 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-gray-600"
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500">
        Notes are stored locally in your browser. They persist across sessions but not across devices.
      </div>
    </div>
  );
}
