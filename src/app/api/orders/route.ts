import { NextResponse } from 'next/server';

interface BigCommerceOrder {
  id: number;
  status_id: number;
  [key: string]: unknown;
}

export async function GET() {
  const BC_STORE_HASH = process.env.BC_STORE_HASH;
  const BC_API_TOKEN = process.env.BC_API_TOKEN;

  if (!BC_STORE_HASH || !BC_API_TOKEN) {
    return NextResponse.json(
      { error: 'Missing BigCommerce credentials' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders`,
      {
        method: 'GET',
        headers: {
          'X-Auth-Token': BC_API_TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `BigCommerce API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Get all orders first (debug - remove filter to see all statuses)
    const orders: BigCommerceOrder[] = Array.isArray(data) ? data : (data as { orders: BigCommerceOrder[] }).orders || [];
    
    // Log status IDs in store for debugging
    const statusIds = new Set(orders.map(o => o.status_id));
    console.log('Available status IDs in store:', Array.from(statusIds).sort());
    
    // Filter for status_id = 11 (Awaiting Fulfillment)
    const filteredOrders = orders.filter((order: BigCommerceOrder) => order.status_id === 11);
    
    // Return all orders for now (debug)
    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
    console.error('BC API Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
