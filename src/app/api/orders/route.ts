import { NextResponse } from 'next/server';

interface BigCommerceOrder {
  id: number;
  status_id: number;
  date_created: string;
  products?: { url?: string; resource?: string } | any[];
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

  const headers = {
    'X-Auth-Token': BC_API_TOKEN,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  try {
    // Fetch up to 250 orders sorted newest-first
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders?limit=250&sort=date_created:desc`,
      { method: 'GET', headers }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `BigCommerce API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const ordersRaw: BigCommerceOrder[] = Array.isArray(data)
      ? data
      : ((data as any)?.orders ?? []);

    // Filter: 2026 + status_id 11 (Awaiting Fulfillment)
    const total = ordersRaw.length;
    const orders2026 = ordersRaw.filter((o) => {
      const d = new Date(String(o.date_created));
      return d.getFullYear() === 2026;
    });
    const awaiting11 = orders2026.filter((o) => Number(o.status_id) === 11);
    const awaiting2 = orders2026.filter((o) => Number(o.status_id) === 2);

    console.log(`[Orders API] Total fetched: ${total}`);
    console.log(`[Orders API] 2026 orders: ${orders2026.length}`);
    console.log(`[Orders API] 2026 + status_id=11: ${awaiting11.length}`);
    console.log(`[Orders API] 2026 + status_id=2: ${awaiting2.length}`);

    const awaitingOrders = awaiting11.length > 0 ? awaiting11 : awaiting2;
    const latest50 = awaitingOrders
      .sort((a, b) =>
        new Date(String(b.date_created)).getTime() - new Date(String(a.date_created)).getTime()
      )
      .slice(0, 50);

    // Fetch product details for each order (BC v2 returns products as URL ref)
    const enriched = await Promise.all(
      latest50.map(async (order) => {
        try {
          const prodUrl = `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders/${order.id}/products`;
          const prodRes = await fetch(prodUrl, { method: 'GET', headers });
          if (prodRes.ok) {
            const products = await prodRes.json();
            return { ...order, products: Array.isArray(products) ? products : [] };
          }
        } catch (e) {
          console.error(`[Orders API] Failed to fetch products for order ${order.id}:`, e);
        }
        return { ...order, products: [] };
      })
    );

    console.log(`[Orders API] Returning ${enriched.length} enriched orders`);

    return NextResponse.json(enriched, {
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
