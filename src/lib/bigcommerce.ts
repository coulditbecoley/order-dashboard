import { BigCommerceOrder, BigCommerceOrderProduct, OrdersResponse, OrderFilters } from '@/types';

const BC_STORE_HASH = process.env.BC_STORE_HASH!;
const BC_API_TOKEN = process.env.BC_API_TOKEN!;

const BASE_URL = `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2`;

async function bcFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Auth-Token': BC_API_TOKEN,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    next: { revalidate: 0 },
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

// Webhooks removed - manual sync only
