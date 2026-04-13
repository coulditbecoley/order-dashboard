'use client';

import { BigCommerceOrder } from '@/types';
import StatusBadge from './StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, ShoppingBag, User, Mail } from 'lucide-react';
import Link from 'next/link';

interface OrderCardProps {
  order: BigCommerceOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
  const customerName = `${order.billing_address.first_name} ${order.billing_address.last_name}`.trim();
  const timeAgo = formatDistanceToNow(new Date(order.date_created), { addSuffix: true });
  const total = parseFloat(order.total_inc_tax).toLocaleString('en-US', {
    style: 'currency',
    currency: order.currency_code || 'USD',
  });

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm">#{order.id}</span>
            <StatusBadge statusId={order.status_id} statusText={order.status} />
            <span className="text-xs text-gray-400 ml-auto">{timeAgo}</span>
          </div>

          {/* Customer */}
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium">{customerName || 'Guest'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{order.billing_address.email}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 text-gray-500">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{order.items_total} item{order.items_total !== 1 ? 's' : ''}</span>
            </div>
            <span className="font-bold text-gray-900 ml-auto">{total}</span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    </Link>
  );
}
