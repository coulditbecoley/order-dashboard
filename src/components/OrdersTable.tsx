'use client';

import { useState, useEffect } from 'react';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { BigCommerceOrder } from '@/types';
import { getOrders, saveOrdersCache } from '@/lib/bigcommerce-client';
import { formatDate } from 'date-fns';

interface OrderRow {
  orderNumber: string;
  date: string;
  notes: string;
  cut: string;
  qty: string;
  type: string;
  model: string;
  light: string;
  hand: string;
  color: string;
  oc: string;
  magHw: string;
  clip: string;
  mw: string;
  washer: string;
  acc: string;
  secCord: string;
}

function extractOrderDetails(order: BigCommerceOrder): OrderRow {
  // Extract custom fields from staff_notes and customer_message
  const notes = order.customer_message || order.staff_notes || '';
  
  // Parse product options from first product
  const product = order.products?.[0];
  const options = product?.product_options || [];
  
  const getOptionValue = (displayName: string): string => {
    const opt = options.find(o => o.display_name?.toLowerCase().includes(displayName.toLowerCase()));
    return opt?.display_value || '—';
  };

  return {
    orderNumber: String(order.id),
    date: formatDate(new Date(order.date_created), 'MMM dd, yyyy'),
    notes: notes.substring(0, 50) + (notes.length > 50 ? '...' : ''),
    cut: getOptionValue('cut'),
    qty: String(product?.quantity || order.items_total || '—'),
    type: getOptionValue('type') || product?.type || '—',
    model: getOptionValue('model'),
    light: getOptionValue('light'),
    hand: getOptionValue('hand'),
    color: getOptionValue('color'),
    oc: getOptionValue('oc'),
    magHw: getOptionValue('mag') || getOptionValue('hardware'),
    clip: getOptionValue('clip'),
    mw: getOptionValue('mw'),
    washer: getOptionValue('washer'),
    acc: getOptionValue('acc'),
    secCord: getOptionValue('cord'),
  };
}

type SortField = keyof OrderRow;

export default function OrdersTable() {
  const [orders, setOrders] = useState<BigCommerceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const syncOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrders({
        page: 1,
        limit: 100,
        sort: 'date_created',
        direction: 'desc',
      });
      setOrders(response.orders);
      saveOrdersCache(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync orders';
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncOrders();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const rows = orders.map(extractOrderDetails).sort((a, b) => {
    const aVal = String(a[sortField]);
    const bVal = String(b[sortField]);
    
    const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const columns: { key: SortField; label: string }[] = [
    { key: 'orderNumber', label: 'ORDER #' },
    { key: 'date', label: 'DATE' },
    { key: 'notes', label: 'NOTES' },
    { key: 'cut', label: 'CUT' },
    { key: 'qty', label: 'QTY' },
    { key: 'type', label: 'TYPE' },
    { key: 'model', label: 'MODEL' },
    { key: 'light', label: 'LIGHT' },
    { key: 'hand', label: 'HAND' },
    { key: 'color', label: 'COLOR' },
    { key: 'oc', label: 'OC' },
    { key: 'magHw', label: 'MAG/HW' },
    { key: 'clip', label: 'CLIP' },
    { key: 'mw', label: 'MW' },
    { key: 'washer', label: 'WASHER' },
    { key: 'acc', label: 'ACC' },
    { key: 'secCord', label: 'SEC CORD' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            {rows.length} orders • BigCommerce sync
          </p>
        </div>
        <button
          onClick={syncOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Syncing...' : 'Sync Orders'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-800 sticky top-0">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortField === col.key && (
                      <ArrowUpDown className={`h-3 w-3 text-indigo-400 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  {loading ? 'Loading orders...' : 'No orders found'}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.orderNumber}
                  className="bg-gray-900/50 hover:bg-gray-900 transition-colors"
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500">
        Last synced: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
