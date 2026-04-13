import { WebhookEvent } from '@/types';

// In-memory store for webhook events (use a DB in production)
const webhookEvents: WebhookEvent[] = [];
const MAX_EVENTS = 500;

export function storeWebhookEvent(event: WebhookEvent): void {
  webhookEvents.unshift(event);
  if (webhookEvents.length > MAX_EVENTS) {
    webhookEvents.splice(MAX_EVENTS);
  }
}

export function getWebhookEvents(): WebhookEvent[] {
  return [...webhookEvents];
}

export function getRecentOrderIds(): number[] {
  return webhookEvents
    .filter(e => e.data?.type === 'order' && e.data?.id)
    .map(e => e.data.id)
    .slice(0, 50);
}
