'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { BigCommerceOrder } from '@/types';
import { formatDate } from 'date-fns';

interface OrderRow {
  id: number;
  orderNumber: string;
  statusId: string;
  date: string;
  cut: string;
  qty: string;
  type: string;
  model: string;
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

interface CutCheckState {
  [key: string]: boolean;
}

function stripPrice(value: string): string {
  if (!value) return '—';
  return value.replace(/\s*\([^)]*\$[^)]*\)/g, '').replace(/\s*\([^)]*\s+\d+\s+off\)/g, '').trim();
}



function normalizeClip(clip: string): string {
  if (!clip || clip === '—') return '—';
  clip = stripPrice(clip);
  // Common abbreviations for belt attachment types
  clip = clip.replace(/Discreet Carry Clip/i, 'DCC');
  clip = clip.replace(/Double Soft Loops/i, 'DSL');
  clip = clip.replace(/Single Soft Loop/i, 'SSL');
  clip = clip.replace(/Pull The Dot/i, 'PTD');
  clip = clip.replace(/Modular Wing/i, 'MW');
  return clip;
}

function extractBool(text: string): string {
  if (!text || text === '—') return '—';
  return text.toLowerCase().includes('yes') ? 'Yes' : text.toLowerCase().includes('no') ? 'No' : stripPrice(text);
}

function extractOrderDetails(order: BigCommerceOrder): OrderRow {
  const product = order.products?.[0];
  // Collect options from all products in the order (handle multi-product orders)
  const allProductOptions = (order.products || []).flatMap(p => p.product_options || []);
  // Helper to find option value by display name across all products
  const getOptionValue = (displayName: string): string => {
    const opt = allProductOptions.find(o => o.display_name?.toLowerCase().includes(displayName.toLowerCase()));
    return opt?.display_value || '—';
  };

  // Extract fields
  const modelStr = getOptionValue('model');
  // Light info reserved for future column use
  // const lightStr = getOptionValue('light') || extractLight(modelStr);
  const colorStr = getOptionValue('color') || getOptionValue('front color');
  const backColorStr = getOptionValue('back color');
  // Belt attachment is the primary data source; fall back to clip or belt loop if not present
  const clipStr = getOptionValue('belt attachment') || getOptionValue('clip') || getOptionValue('belt loop');
  const magStr = getOptionValue('mag carrier') || getOptionValue('non connected mag');
  const mwStr = getOptionValue('modwing') || getOptionValue('tek-mount');
  const washersStr = getOptionValue('washers') || getOptionValue('finishing washers');

  return {
    id: order.id,
    orderNumber: String(order.id),
    statusId: String(order.status_id),
    date: formatDate(new Date(order.date_created), 'MM/dd/yy'),
    cut: extractBool(getOptionValue('cut')),
    qty: String(product?.quantity || order.items_total || '—'),
    type: product?.name || '—',
    model: modelStr !== '—' ? stripPrice(modelStr) : '—',
    hand: stripPrice(getOptionValue('hand')).replace(/\s*Hand$/i, ''),
    color: backColorStr ? `${stripPrice(colorStr)} / ${stripPrice(backColorStr)}` : stripPrice(colorStr),
    oc: extractBool(getOptionValue('optic cut')),
    magHw: extractBool(magStr),
    clip: normalizeClip(clipStr),
    mw: extractBool(mwStr),
    washer: washersStr?.toLowerCase().includes('none') ? 'None' : stripPrice(washersStr),
    acc: getOptionValue('accessory') === '—' ? '—' : stripPrice(getOptionValue('accessory')),
    secCord: extractBool(getOptionValue('security cord')),
  };
}

type SortField = keyof OrderRow;

export default function OrdersTable() {
  const [orders, setOrders] = useState<BigCommerceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [cutChecks, setCutChecks] = useState<CutCheckState>({});

  const syncOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync orders';
      setError(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cut states from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kobra_cut_states');
    if (saved) {
      try {
        setCutChecks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cut states:', e);
      }
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle checkbox change for CUT column
  const handleCutChange = (orderId: number, checked: boolean) => {
    const key = `order_${orderId}`;
    const newStates = { ...cutChecks, [key]: checked };
    setCutChecks(newStates);
    localStorage.setItem('kobra_cut_states', JSON.stringify(newStates));
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
    { key: 'cut', label: 'CUT' },
    { key: 'qty', label: 'QTY' },
    { key: 'type', label: 'TYPE' },
    { key: 'model', label: 'MODEL' },
    { key: 'hand', label: 'HAND' },
    { key: 'color', label: 'COLOR' },
    { key: 'oc', label: 'OC' },
    { key: 'magHw', label: 'MAG/HW' },
    { key: 'clip', label: 'CLIP' },
    { key: 'mw', label: 'MW' },
    { key: 'washer', label: 'WASHER' },
    { key: 'acc', label: 'ACC' },
    { key: 'secCord', label: 'SEC CORD' },
    { key: 'statusId', label: 'STATUS_ID' },
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
              rows.map((row) => {
                const cutKey = `order_${row.id}`;
                const isCutChecked = cutChecks[cutKey] || false;
                return (
                  <tr
                    key={row.orderNumber}
                    className="bg-gray-900/50 hover:bg-gray-900 transition-colors"
                  >
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-gray-300 whitespace-nowrap">
                        {col.key === 'cut' ? (
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isCutChecked}
                              onChange={(e) => handleCutChange(row.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 cursor-pointer"
                            />
                          </div>
                        ) : (
                          row[col.key]
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
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
