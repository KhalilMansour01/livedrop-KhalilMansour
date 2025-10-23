import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Order } from '../lib/api'
import { api } from '../lib/api'
import { Button } from '../components/atoms/button'
import { formatCurrency, formatOrderId } from '../lib/format'

const OrderStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        try {
          const orderData = await api.getOrderStatus(id)
          setOrder(orderData)
        } catch (error) {
          console.error('Failed to load order:', error)
          setOrder(null)
        } finally {
          setLoading(false)
        }
      }
    }
    loadOrder()
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Loading order...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">The order {formatOrderId(id || '')} could not be found.</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' }
  ]

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status)

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Shopping
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-600">Order ID: {formatOrderId(order.id)}</p>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="text-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    index <= currentStepIndex 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm ${
                    index <= currentStepIndex ? 'text-green-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Status:</span> {order.status}</p>
                {order.carrier && <p><span className="font-medium">Carrier:</span> {order.carrier}</p>}
                {order.eta && <p><span className="font-medium">Estimated Delivery:</span> {order.eta}</p>}
                <p><span className="font-medium">Total:</span> {formatCurrency(order.total)}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Items</h2>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-gray-600 text-sm">
                        Qty: {item.quantity} × {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderStatus