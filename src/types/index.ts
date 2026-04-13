export interface BigCommerceOrder {
  id: number;
  date_created: string;
  date_modified: string;
  status: string;
  status_id: number;
  customer_id: number;
  billing_address: {
    first_name: string;
    last_name: string;
    email: string;
    street_1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  total_inc_tax: string;
  total_ex_tax: string;
  subtotal_inc_tax: string;
  shipping_cost_inc_tax: string;
  items_total: number;
  items_shipped: number;
  payment_method: string;
  payment_status: string;
  refunded_amount: string;
  currency_code: string;
  customer_message: string;
  staff_notes: string;
  products?: BigCommerceOrderProduct[];
}

export interface BigCommerceOrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  base_price: string;
  price_inc_tax: string;
  total_inc_tax: string;
  type: string;
  refund_amount: string;
  quantity_shipped: number;
  event_name: string | null;
  product_options: {
    id: number;
    option_id: number;
    order_product_id: number;
    display_name: string;
    display_value: string;
    value: string;
    type: string;
    name: string;
  }[];
}

export interface OrdersResponse {
  orders: BigCommerceOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type OrderSortField = 'id' | 'date_created' | 'total_inc_tax' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface OrderFilters {
  status?: string;
  sort: OrderSortField;
  direction: SortDirection;
  page: number;
  limit: number;
  search?: string;
}

// Manual sync only - no webhooks or auto-refresh
export const ORDER_STATUSES: Record<number, { label: string; color: string }> = {
  0: { label: 'Incomplete', color: 'bg-gray-100 text-gray-700' },
  1: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  2: { label: 'Shipped', color: 'bg-blue-100 text-blue-700' },
  3: { label: 'Partially Shipped', color: 'bg-blue-50 text-blue-600' },
  4: { label: 'Refunded', color: 'bg-red-100 text-red-700' },
  5: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  6: { label: 'Declined', color: 'bg-red-100 text-red-700' },
  7: { label: 'Awaiting Payment', color: 'bg-orange-100 text-orange-700' },
  8: { label: 'Awaiting Pickup', color: 'bg-purple-100 text-purple-700' },
  9: { label: 'Awaiting Shipment', color: 'bg-indigo-100 text-indigo-700' },
  10: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  11: { label: 'Awaiting Fulfillment', color: 'bg-teal-100 text-teal-700' },
  12: { label: 'Manual Verification Required', color: 'bg-orange-100 text-orange-700' },
  13: { label: 'Disputed', color: 'bg-red-100 text-red-700' },
  14: { label: 'Partially Refunded', color: 'bg-red-50 text-red-600' },
};
