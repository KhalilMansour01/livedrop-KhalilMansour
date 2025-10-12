import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../atoms/button'
import { useCartStore } from '../../lib/store'

export const Header: React.FC = () => {
  const itemCount = useCartStore((state) => state.getItemCount())

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl">🛍️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Elegance
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Premium Store</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="primary" className="relative rounded-2xl">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">🛒</span>
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                      {itemCount}
                    </span>
                  )}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}