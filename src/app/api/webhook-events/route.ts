import { NextResponse } from 'next/server';
import { getWebhookEvents } from '@/lib/webhooks';

export const dynamic = 'force-dynamic';

export async function GET() {
  const events = getWebhookEvents();
  return NextResponse.json({ events, count: events.length });
}
