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
    // Fetch up to 250 orders sorted newest-first so 2026 orders come back first
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders?limit=250&sort=date_created:desc`,
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
    const ordersRaw: BigCommerceOrder[] = Array.isArray(data)
      ? data
      : ((data as any)?.orders ?? []);

    // --- Two-stage diagnostic filter ---
    // Stage 1: How many orders total?
    const total = ordersRaw.length;

    // Stage 2: Filter by year 2026
    const orders2026 = ordersRaw.filter((o) => {
      const d = new Date(String(o.date_created));
      return d.getFullYear() === 2026;
    });

    // Stage 3: Filter by status_id 11 (Awaiting Fulfillment - BC v2)
    const awaiting11 = orders2026.filter((o) => Number(o.status_id) === 11);

    // Stage 4: Also check status_id 2 (in case store uses legacy mapping)
    const awaiting2 = orders2026.filter((o) => Number(o.status_id) === 2);

    // Log diagnostics
    console.log(`[Orders API] Total fetched: ${total}`);
    console.log(`[Orders API] 2026 orders: ${orders2026.length}`);
    console.log(`[Orders API] 2026 + status_id=11: ${awaiting11.length}`);
    console.log(`[Orders API] 2026 + status_id=2: ${awaiting2.length}`);
    if (orders2026.length > 0) {
      const statusIds = [...new Set(orders2026.map((o) => o.status_id))];
      console.log(`[Orders API] Unique status_ids in 2026 orders: ${statusIds.join(', ')}`);
    }
    if (ordersRaw.length > 0) {
      const years = [...new Set(ordersRaw.map((o) => new Date(String(o.date_created)).getFullYear()))];
      console.log(`[Orders API] Years in fetched data: ${years.sort().join(', ')}`);
    }

    // Use whichever status has results: prefer 11, fallback to 2
    const awaitingOrders = awaiting11.length > 0 ? awaiting11 : awaiting2;

    // Sort newest first, take 50
    const latest50 = awaitingOrders
      .sort((a, b) =>
        new Date(String(b.date_created)).getTime() - new Date(String(a.date_created)).getTime()
      )
      .slice(0, 50);

    return NextResponse.json(latest50, {
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
