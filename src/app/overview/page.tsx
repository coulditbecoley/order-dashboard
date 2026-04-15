'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OverviewStats {
  orderCount: number;
  orderLoading: boolean;
  toOrderCount: number;
  toOrderCompleted: number;
  notesUsed: number;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats>({
    orderCount: 0,
    orderLoading: true,
    toOrderCount: 0,
    toOrderCompleted: 0,
    notesUsed: 0,
  });

  useEffect(() => {
    // Fetch live order count from BigCommerce API
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          const orders = Array.isArray(data) ? data : data.orders || [];
          setStats((prev) => ({
            ...prev,
            orderCount: orders.length,
            orderLoading: false,
          }));
        } else {
          setStats((prev) => ({ ...prev, orderLoading: false }));
        }
      } catch {
        setStats((prev) => ({ ...prev, orderLoading: false }));
      }
    };

    // Read To Order items from localStorage
    const toOrderRaw = localStorage.getItem('kobra_to_order_items');
    let toOrderCount = 0;
    let toOrderCompleted = 0;
    if (toOrderRaw) {
      try {
        const items = JSON.parse(toOrderRaw);
        if (Array.isArray(items)) {
          toOrderCount = items.length;
          toOrderCompleted = items.filter((i: { completed?: boolean }) => i.completed).length;
        }
      } catch {}
    }

    // Read Notes from localStorage
    const notesRaw = localStorage.getItem('kobra_notes');
    let notesUsed = 0;
    if (notesRaw) {
      try {
        const notes = JSON.parse(notesRaw);
        if (Array.isArray(notes)) {
          notesUsed = notes.filter((n: { content?: string }) => n.content && n.content.trim().length > 0).length;
        }
      } catch {}
    }

    setStats((prev) => ({ ...prev, toOrderCount, toOrderCompleted, notesUsed }));
    fetchOrders();
  }, []);

  const orderProgress = stats.orderCount > 0 ? 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Dashboard summary • Kobra Holsters
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Orders Card */}
        <Link
          href="/"
          className="rounded-lg border border-gray-800 bg-gray-900 p-6 hover:border-indigo-500/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-600/20">
              <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-100 group-hover:text-white">Orders</h2>
          </div>

          {stats.orderLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading orders...</span>
            </div>
          ) : (
            <>
              <p className="text-4xl font-bold text-white mb-2">{stats.orderCount}</p>
              <p className="text-xs text-gray-400 mb-3">current orders from BigCommerce</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div
                  className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${orderProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.orderCount} order{stats.orderCount !== 1 ? 's' : ''} active</p>
            </>
          )}
        </Link>

        {/* To Order Card */}
        <Link
          href="/to-order"
          className="rounded-lg border border-gray-800 bg-gray-900 p-6 hover:border-indigo-500/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-600/20">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-100 group-hover:text-white">To Order</h2>
          </div>

          <p className="text-4xl font-bold text-white mb-2">{stats.toOrderCount}</p>
          <p className="text-xs text-gray-400 mb-3">
            {stats.toOrderCompleted} completed • {stats.toOrderCount - stats.toOrderCompleted} pending
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: stats.toOrderCount > 0 ? `${Math.round((stats.toOrderCompleted / stats.toOrderCount) * 100)}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.toOrderCount > 0 ? `${Math.round((stats.toOrderCompleted / stats.toOrderCount) * 100)}%` : '0%'} complete
          </p>
        </Link>

        {/* Notes Card */}
        <Link
          href="/notes"
          className="rounded-lg border border-gray-800 bg-gray-900 p-6 hover:border-indigo-500/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-600/20">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-100 group-hover:text-white">Notes</h2>
          </div>

          <p className="text-4xl font-bold text-white mb-2">{stats.notesUsed}<span className="text-lg text-gray-500">/5</span></p>
          <p className="text-xs text-gray-400 mb-3">note slots in use</p>

          {/* Usage bar */}
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(stats.notesUsed / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{5 - stats.notesUsed} slot{5 - stats.notesUsed !== 1 ? 's' : ''} available</p>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500">
        Order count fetched live from BigCommerce. To Order and Notes data read from local browser storage.
      </div>
    </div>
  );
}
