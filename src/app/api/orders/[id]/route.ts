import { NextRequest, NextResponse } from 'next/server';
import { getOrderWithProducts } from '@/lib/bigcommerce';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const order = await getOrderWithProducts(orderId);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Order detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
