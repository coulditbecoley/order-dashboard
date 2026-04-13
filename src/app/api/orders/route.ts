import { NextResponse } from 'next/server';

interface BigCommerceOrder {
  id: number;
  status_id: number;
  date_created: string;
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
    
    // Get all orders
    const orders: BigCommerceOrder[] = Array.isArray(data) ? data : (data as { orders: BigCommerceOrder[] }).orders || [];
    
    // Filter for status_id = 2 (Awaiting Fulfillment)
    const filteredOrders = orders.filter((order: BigCommerceOrder) => order.status_id === 2);
    
    // Sort by date_created (oldest first)
    const sortedOrders = filteredOrders.sort((a: BigCommerceOrder, b: BigCommerceOrder) => {
      const dateA = new Date(a.date_created as string).getTime();
      const dateB = new Date(b.date_created as string).getTime();
      return dateA - dateB; // Oldest first
    });
    
    // Return filtered and sorted orders
    return NextResponse.json(sortedOrders, {
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
