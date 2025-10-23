import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/atoms/button'
import { formatCurrency } from '../lib/format'
import { useCartStore } from '../lib/store'

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Button variant="outline" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {items.map((item) => (
          <div key={item.product._id} className="border-b last:border-b-0">
            <div className="p-6 flex items-center">
              <img 
                src={item.product.image} 
                alt={item.product.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="ml-6 flex-1">
                <h3 className="text-lg font-semibold">{item.product.title}</h3>
                <p className="text-gray-600">{formatCurrency(item.product.price)}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                >
                  -
                </Button>
                
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stockQty}
                >
                  +
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.product._id)}
                  className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
              
              <div className="ml-6 text-right">
                <p className="text-lg font-semibold">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold">Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(getTotal())}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/checkout" className="flex-1">
            <Button className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Cart