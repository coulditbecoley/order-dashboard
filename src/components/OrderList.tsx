'use client';

import { useState, useEffect, useCallback } from 'react';
import { BigCommerceOrder, OrderFilters, OrdersResponse } from '@/types';
import OrderCard from './OrderCard';
import OrderFiltersBar from './OrderFilters';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';

const DEFAULT_FILTERS: OrderFilters = {
  page: 1,
  limit: 20,
  sort: 'id',
  direction: 'desc',
};

export default function OrderList() {
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [response, setResponse] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOrders = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
        sort: filters.sort,
        direction: filters.direction,
      });
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/orders?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: OrdersResponse = await res.json();
      setResponse(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  // Initial load and filter changes
  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = useCallback((changes: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...changes }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders…" />
      </div>
    );
  }

  if (error && !response) {
    return <ErrorMessage message={error} onRetry={() => fetchOrders(true)} />;
  }

  const orders: BigCommerceOrder[] = response?.orders ?? [];

  return (
    <div className="space-y-4">
      <OrderFiltersBar
        filters={filters}
        onChange={handleFilterChange}
        totalOrders={response?.total ?? 0}
        isRefreshing={refreshing}
        onRefresh={() => fetchOrders(true)}
        lastUpdated={lastUpdated}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          Refresh failed: {error}. Showing last known data.
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          <Pagination
            page={response?.page ?? 1}
            totalPages={response?.totalPages ?? 1}
            onPageChange={page => handleFilterChange({ page })}
          />
        </>
      )}
    </div>
  );
}
