import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function OrderHistoryPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order # {order.id}</p>
                  <p className="text-sm font-medium text-gray-900">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-left md:text-right">
                  <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Method: <span className="font-semibold text-gray-700">{order.paymentMethod.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>

              {/* Order Status */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Payment Status</h3>
                  <p className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${order.paymentStatus === 'Verified' ? 'bg-green-100 text-green-800' : 
                      order.paymentStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.paymentStatus.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <ul className="divide-y divide-gray-200">
                {order.orderItems.map((item: any) => (
                  <li key={item.id} className="p-6 flex items-center">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                      {item.product?.imageURLs?.[0] ? (
                        <img src={item.product.imageURLs[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex justify-center items-center bg-gray-200 text-xs text-gray-500">No Img</div>
                      )}
                    </div>
                    <div className="ml-6 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.product?.name || 'Unknown Product'}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">${item.priceAtPurchase}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
