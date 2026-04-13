'use client';

import { useState, useEffect } from 'react';
import { BigCommerceOrder } from '@/types';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, CreditCard, Package, User, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

interface OrderDetailsProps {
  orderId: number;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <span className="text-gray-500">{label}: </span>
        <span className="text-gray-900 font-medium">{value || '—'}</span>
      </div>
    </div>
  );
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<BigCommerceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details…" />
      </div>
    );
  }

  if (error || !order) {
    return <ErrorMessage message={error ?? 'Order not found'} />;
  }

  const customerName = `${order.billing_address.first_name} ${order.billing_address.last_name}`.trim();
  const total = parseFloat(order.total_inc_tax).toLocaleString('en-US', {
    style: 'currency',
    currency: order.currency_code || 'USD',
  });
  const subtotal = parseFloat(order.subtotal_inc_tax).toLocaleString('en-US', {
    style: 'currency',
    currency: order.currency_code || 'USD',
  });
  const shipping = parseFloat(order.shipping_cost_inc_tax).toLocaleString('en-US', {
    style: 'currency',
    currency: order.currency_code || 'USD',
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Back to orders"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
            <StatusBadge statusId={order.status_id} statusText={order.status} />
          </div>
          <p className="text-sm text-gray-500">
            Placed {format(new Date(order.date_created), 'PPP p')}
          </p>
        </div>
      </div>

      {/* Customer */}
      <DetailSection title="Customer">
        <div className="space-y-2">
          <InfoRow icon={User} label="Name" value={customerName || 'Guest'} />
          <InfoRow icon={Mail} label="Email" value={order.billing_address.email} />
          {order.billing_address.street_1 && (
            <InfoRow
              icon={MapPin}
              label="Address"
              value={`${order.billing_address.street_1}, ${order.billing_address.city}, ${order.billing_address.state} ${order.billing_address.zip}`}
            />
          )}
        </div>
      </DetailSection>

      {/* Payment */}
      <DetailSection title="Payment">
        <div className="space-y-2">
          <InfoRow icon={CreditCard} label="Method" value={order.payment_method} />
          <InfoRow label="Status" value={order.payment_status} />
          <InfoRow label="Currency" value={order.currency_code} />
        </div>
      </DetailSection>

      {/* Order Items */}
      <DetailSection title={`Items (${order.items_total})`}>
        {order.products && order.products.length > 0 ? (
          <div className="space-y-3">
            {order.products.map(product => (
              <div key={product.id} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="rounded-lg bg-gray-100 p-2 flex-shrink-0">
                  <Package className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  {product.sku && (
                    <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                  )}
                  {product.product_options?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {product.product_options.map(opt => (
                        <span key={opt.id} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {opt.display_name}: {opt.display_value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {parseFloat(product.total_inc_tax).toLocaleString('en-US', {
                      style: 'currency',
                      currency: order.currency_code || 'USD',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No product details available</p>
        )}
      </DetailSection>

      {/* Order Summary */}
      <DetailSection title="Summary">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{shipping}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{total}</span>
          </div>
        </div>
      </DetailSection>

      {order.customer_message && (
        <DetailSection title="Customer Note">
          <p className="text-sm text-gray-700 italic">"{order.customer_message}"</p>
        </DetailSection>
      )}
    </div>
  );
}
