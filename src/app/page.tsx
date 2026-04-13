import OrderList from '@/components/OrderList';
import { ShoppingBag } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        </div>
        <p className="text-sm text-gray-500">
          BigCommerce orders. Click &quot;Sync orders&quot; to fetch the latest data.
        </p>
      </div>
      <OrderList />
    </div>
  );
}
