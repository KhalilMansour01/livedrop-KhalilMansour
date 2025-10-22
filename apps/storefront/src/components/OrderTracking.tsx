import React, { useState, useEffect } from 'react';
import { api, Order } from '../lib/api';
import { sseClient, OrderStatusUpdate } from '../lib/sse-client';

interface OrderTrackingProps {
  orderId: string;
  onClose: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdates, setStatusUpdates] = useState<OrderStatusUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadOrder();
    connectToUpdates();

    return () => {
      sseClient.disconnect(orderId);
    };
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await api.getOrderStatus(orderId);
      setOrder(orderData);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Order loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const connectToUpdates = () => {
    const connection = sseClient.connectToOrderStatus(
      orderId,
      (update) => {
        setStatusUpdates(prev => [...prev, update]);
        // Update the order status in real-time
        setOrder(prev => prev ? { ...prev, status: update.status } : null);
      },
      (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
      },
      () => {
        console.log('Order tracking complete');
        setIsConnected(false);
      }
    );

    setIsConnected(connection.isConnected);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'PROCESSING': return '📦';
      case 'SHIPPED': return '🚚';
      case 'DELIVERED': return '✅';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load order details.'}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Order Tracking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Order ID:</span>
              <p className="font-mono text-lg">{order._id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total:</span>
              <p className="text-lg font-semibold">${order.total.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Created:</span>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live tracking active' : 'Connection lost - attempting to reconnect...'}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Order Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Info */}
        {order.carrier && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Shipping Information</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p><span className="font-medium">Carrier:</span> {order.carrier}</p>
              {order.estimatedDelivery && (
                <p><span className="font-medium">Estimated Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Status Updates */}
        {statusUpdates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Status Updates</h3>
            <div className="space-y-3">
              {statusUpdates.map((update, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getStatusColor(update.status)}`}>
                    {getStatusIcon(update.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{update.message}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(update.timestamp).toLocaleString()}
                    </p>
                    {update.carrier && (
                      <p className="text-sm text-gray-600">Carrier: {update.carrier}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
