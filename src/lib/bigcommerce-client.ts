import { BigCommerceOrder, BigCommerceOrderProduct, OrdersResponse, OrderFilters } from '@/types';

// Client-side BigCommerce API client
// Token should be passed via environment variable (public at build time)
const BC_STORE_HASH = process.env.NEXT_PUBLIC_BC_STORE_HASH;
const BC_API_TOKEN = process.env.NEXT_PUBLIC_BC_API_TOKEN;

const BASE_URL = `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2`;

async function bcFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BC_STORE_HASH || !BC_API_TOKEN) {
    throw new Error('BigCommerce credentials not configured. Set NEXT_PUBLIC_BC_STORE_HASH and NEXT_PUBLIC_BC_API_TOKEN.');
  }

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Auth-Token': BC_API_TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BigCommerce API error ${res.status}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return [] as unknown as T;

  return res.json();
}

export async function getOrders(filters: OrderFilters): Promise<OrdersResponse> {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sort: filters.sort,
    direction: filters.direction,
  });

  if (filters.status) params.set('status_id', filters.status);
  if (filters.search) params.set('customer_name', filters.search);

  try {
    const [orders, count] = await Promise.all([
      bcFetch<BigCommerceOrder[]>(`/orders?${params}`),
      getOrderCount(filters.status),
    ]);

    return {
      orders: Array.isArray(orders) ? orders : [],
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(count / filters.limit),
    };
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    // Try to return cached orders from localStorage
    const cached = localStorage.getItem('orders-cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        throw error;
      }
    }
    throw error;
  }
}

export async function getOrderCount(statusId?: string): Promise<number> {
  const params = statusId ? `?status_id=${statusId}` : '';
  try {
    const data = await bcFetch<{ count: number }>(`/orders/count${params}`);
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getOrder(orderId: number): Promise<BigCommerceOrder> {
  return bcFetch<BigCommerceOrder>(`/orders/${orderId}`);
}

export async function getOrderProducts(orderId: number): Promise<BigCommerceOrderProduct[]> {
  const data = await bcFetch<BigCommerceOrderProduct[]>(`/orders/${orderId}/products`);
  return Array.isArray(data) ? data : [];
}

export async function getOrderWithProducts(orderId: number): Promise<BigCommerceOrder> {
  const [order, products] = await Promise.all([
    getOrder(orderId),
    getOrderProducts(orderId),
  ]);
  return { ...order, products };
}

// Cache management for static site
export function saveOrdersCache(data: OrdersResponse): void {
  try {
    localStorage.setItem('orders-cache', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save orders cache:', e);
  }
}

export function getOrdersCache(): OrdersResponse | null {
  try {
    const cached = localStorage.getItem('orders-cache');
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}
