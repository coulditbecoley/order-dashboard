import { NextRequest, NextResponse } from 'next/server';
import { storeWebhookEvent } from '@/lib/webhooks';
import { WebhookEvent } from '@/types';

export const dynamic = 'force-dynamic';

// Receive incoming webhook events from BigCommerce
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as WebhookEvent;

    // Validate basic structure
    if (!payload.scope || !payload.data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const event: WebhookEvent = {
      ...payload,
      id: payload.hash ?? `${Date.now()}-${Math.random()}`,
      processed_at: new Date().toISOString(),
    };

    storeWebhookEvent(event);

    console.log(`Webhook received: ${event.scope} for order ${event.data?.id}`);

    return NextResponse.json({ received: true, scope: event.scope });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// List registered webhooks from BigCommerce
export async function GET() {
  try {
    const { listWebhooks } = await import('@/lib/bigcommerce');
    const hooks = await listWebhooks();
    return NextResponse.json({ webhooks: hooks });
  } catch (error) {
    console.error('List webhooks error:', error);
    return NextResponse.json({ error: 'Failed to list webhooks' }, { status: 500 });
  }
}
