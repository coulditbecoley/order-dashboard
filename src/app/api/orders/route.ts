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
    // Fetch up to 250 orders to have enough pool for filtering
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${BC_STORE_HASH}/v2/orders?limit=250`,
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

    // 50 latest 2026 orders with status_id === 2 (Awaiting Fulfillment)
    const latest2026 = ordersRaw
      .filter((o) => {
        const d = new Date(String(o.date_created));
        return d.getFullYear() === 2026 && Number(o.status_id) === 2;
      })
      .sort((a, b) =>
        new Date(String(b.date_created)).getTime() - new Date(String(a.date_created)).getTime()
      )
      .slice(0, 50);

    return NextResponse.json(latest2026, {
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
