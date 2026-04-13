'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Note: Metadata can't be used in client component, so we'll rely on head.tsx or remove this
// export const metadata: Metadata = {
//   title: 'Kobra Holsters | Order Dashboard',
//   description: 'Real-time order management dashboard for Kobra Holsters',
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <head>
        <title>Kobra Holsters | Order Dashboard</title>
        <meta name="description" content="Real-time order management dashboard for Kobra Holsters" />
      </head>
      <body className={`${inter.className} bg-gray-950 text-gray-50 min-h-screen`}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'w-64' : 'w-20'
            } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
          >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
              {sidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="font-bold text-gray-100 text-sm">Kobra</span>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Sidebar Nav */}
            <nav className="flex-1 px-3 py-4 space-y-2">
              <a
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm transition-colors"
              >
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {sidebarOpen && <span>Orders</span>}
              </a>
            </nav>

            {/* Sidebar Footer */}
            {sidebarOpen && (
              <div className="px-3 py-4 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                  <p className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </p>
                </div>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
