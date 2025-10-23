import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/atoms/button'
import { formatCurrency } from '../lib/format'
import { useCartStore } from '../lib/store'
import { api } from '../lib/api'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCartStore()

  const handlePlaceOrder = async () => {
    // For demo purposes, use demo customer ID
    const customerId = 'demo-customer-id'; // This should come from user login
    const { orderId } = await api.placeOrder(customerId, items)
    clearCart()
    navigate(`/order/${orderId}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/cart" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between items-center py-3 border-b">
                <div>
                  <h3 className="font-medium">{item.product.title}</h3>
                  <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-4 mt-4 border-t">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(getTotal())}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <p className="text-gray-600 mb-4">
              This is a demo checkout. No payment information required.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Note: This is a demonstration only. No actual order will be placed or charged.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Complete Order</h2>
            <Button 
              onClick={handlePlaceOrder}
              className="w-full"
              size="lg"
            >
              Place Order
            </Button>
            <p className="text-gray-600 text-sm mt-3 text-center">
              You won't be charged in this demo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout