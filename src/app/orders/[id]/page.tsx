import OrderDetails from '@/components/OrderDetails';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  return <OrderDetails orderId={orderId} />;
}
