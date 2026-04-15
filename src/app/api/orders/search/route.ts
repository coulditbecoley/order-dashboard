import { NextRequest, NextResponse } from 'next/server';

interface BCProductOption {
  id?: number;
  display_name?: string;
  display_value?: string;
  value?: string;
}

interface BCProduct {
  id: number;
  order_id: number;
  product_id: number;
  name: string;
  quantity?: number;
  product_options?: BCProductOption[];
}

interface BigCommerceOrder {
  id: number;
  status_id: number;
  date_created: string;
  items_total?: number;
  customer_message?: string;
  staff_notes?: string;
  billing_address?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  products?: BCProduct[];
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  const BC_STORE_HASH = process.env.BC_STORE_HASH;
  const BC_API_TOKEN = process.env.BC_API_TOKEN;

  if (!BC_STORE_HASH || !BC_API_TOKEN) {
    return NextResponse.json(
      { error: 'Missing BigCommerce credentials' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() || '';

  if (!query) {
    return NextResponse.json({ orders: [], query: '' });
  }

  const headers = {
    'X-Auth-Token': BC_API_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    // Determine search strategy based on query type
    const isOrderId = /^\d+$/.test(query);
    let matchedOrders: BigCommerceOrder[] = [];

    if (isOrderId) {
      // Direct order lookup by ID
      try {
        const res = await fetch(
          `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders/${query}`,
          { method: 'GET', headers }
        );
        if (res.ok) {
          const order = await res.json();
          if (order && order.id) {
            matchedOrders = [order];
          }
        }
      } catch (e) {
        console.error(`[Search] Order ID lookup failed for ${query}:`, e);
      }
    }

    // Also search by customer name (works for both numeric and text queries)
    if (matchedOrders.length === 0 || !isOrderId) {
      const nameParam = encodeURIComponent(query);
      try {
        const res = await fetch(
          `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders?limit=50&sort=date_created:desc&min_id=1`,
          { method: 'GET', headers }
        );
        if (res.ok) {
          const allOrders: BigCommerceOrder[] = await res.json();
          if (Array.isArray(allOrders)) {
            const lowerQuery = query.toLowerCase();
            const filtered = allOrders.filter((o) => {
              // Match order ID
              if (String(o.id).includes(query)) return true;
              // Match customer name
              const firstName = (o.billing_address?.first_name || '').toLowerCase();
              const lastName = (o.billing_address?.last_name || '').toLowerCase();
              const fullName = `${firstName} ${lastName}`;
              if (fullName.includes(lowerQuery)) return true;
              if (firstName.includes(lowerQuery)) return true;
              if (lastName.includes(lowerQuery)) return true;
              // Match email
              const email = (o.billing_address?.email || '').toLowerCase();
              if (email.includes(lowerQuery)) return true;
              // Match status
              const statusStr = String(o.status_id);
              if (statusStr === query) return true;
              return false;
            });
            // Merge with any direct ID matches, deduplicate
            const existingIds = new Set(matchedOrders.map(o => o.id));
            for (const o of filtered) {
              if (!existingIds.has(o.id)) {
                matchedOrders.push(o);
                existingIds.add(o.id);
              }
            }
          }
        }
      } catch (e) {
        console.error(`[Search] Name search failed for ${nameParam}:`, e);
      }
    }

    // Enrich matched orders with product details
    const enriched = await Promise.all(
      matchedOrders.slice(0, 25).map(async (order) => {
        try {
          const prodUrl = `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders/${order.id}/products`;
          const prodRes = await fetch(prodUrl, { method: 'GET', headers });
          if (prodRes.ok) {
            const products = await prodRes.json();
            return { ...order, products: Array.isArray(products) ? products : [] };
          }
        } catch (e) {
          console.error(`[Search] Failed to fetch products for order ${order.id}:`, e);
        }
        return { ...order, products: [] };
      })
    );

    console.log(`[Search] query="${query}" matched=${enriched.length}`);

    return NextResponse.json(
      { orders: enriched, query },
      { headers: { 'Cache-Control': 'no-cache' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    console.error('[Search] Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
