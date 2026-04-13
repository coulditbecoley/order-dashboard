'use client';

import { ORDER_STATUSES } from '@/types';

interface StatusBadgeProps {
  statusId: number;
  statusText?: string;
}

export default function StatusBadge({ statusId, statusText }: StatusBadgeProps) {
  const status = ORDER_STATUSES[statusId];
  const label = status?.label ?? statusText ?? 'Unknown';
  const color = status?.color ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
