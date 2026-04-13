'use client';

import { OrderFilters, OrderSortField } from '@/types';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useCallback } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: '1', label: 'Pending' },
  { value: '7', label: 'Awaiting Payment' },
  { value: '11', label: 'Awaiting Fulfillment' },
  { value: '9', label: 'Awaiting Shipment' },
  { value: '8', label: 'Awaiting Pickup' },
  { value: '3', label: 'Partially Shipped' },
  { value: '2', label: 'Shipped' },
  { value: '10', label: 'Completed' },
  { value: '5', label: 'Cancelled' },
  { value: '4', label: 'Refunded' },
  { value: '13', label: 'Disputed' },
];

const SORT_OPTIONS: { value: OrderSortField; label: string }[] = [
  { value: 'id', label: 'Order ID' },
  { value: 'date_created', label: 'Date' },
  { value: 'total_inc_tax', label: 'Total' },
  { value: 'status', label: 'Status' },
];

interface OrderFiltersProps {
  filters: OrderFilters;
  onChange: (filters: Partial<OrderFilters>) => void;
  totalOrders: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export default function OrderFiltersBar({
  filters,
  onChange,
  totalOrders,
  isRefreshing,
  onRefresh,
  lastUpdated,
}: OrderFiltersProps) {
  const handleSort = useCallback((field: OrderSortField) => {
    if (filters.sort === field) {
      onChange({ direction: filters.direction === 'asc' ? 'desc' : 'asc', page: 1 });
    } else {
      onChange({ sort: field, direction: 'desc', page: 1 });
    }
  }, [filters.sort, filters.direction, onChange]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by customer name..."
          value={filters.search ?? ''}
          onChange={e => onChange({ search: e.target.value || undefined, page: 1 })}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Status filter */}
        <select
          value={filters.status ?? ''}
          onChange={e => onChange({ status: e.target.value || undefined, page: 1 })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <ArrowUpDown className="h-4 w-4 text-gray-400" />
          <select
            value={filters.sort}
            onChange={e => handleSort(e.target.value as OrderSortField)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => onChange({ direction: filters.direction === 'asc' ? 'desc' : 'asc', page: 1 })}
            className="text-sm px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Sort ${filters.direction === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* Results count */}
        <span className="text-xs text-gray-400 ml-auto">
          {totalOrders.toLocaleString()} order{totalOrders !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sync bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
        <span>
          {lastUpdated ? `Last synced: ${lastUpdated.toLocaleTimeString()}` : 'No sync yet'}
        </span>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50 font-medium"
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>↻</span>
          {isRefreshing ? 'Syncing…' : 'Sync orders'}
        </button>
      </div>
    </div>
  );
}
