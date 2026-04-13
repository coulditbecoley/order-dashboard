import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/bigcommerce';
import { OrderFilters, OrderSortField, SortDirection } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters: OrderFilters = {
      page: parseInt(searchParams.get('page') ?? '1', 10),
      limit: parseInt(searchParams.get('limit') ?? '20', 10),
      sort: (searchParams.get('sort') ?? 'id') as OrderSortField,
      direction: (searchParams.get('direction') ?? 'desc') as SortDirection,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    };

    const data = await getOrders(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
