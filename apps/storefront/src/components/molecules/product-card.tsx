import React from 'react'
import type { Product } from '../../lib/api'
import { Button } from '../atoms/button'
import { formatCurrency } from '../../lib/format'
import { useCartStore } from '../../lib/store'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20 overflow-hidden">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Stock Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
            product.stockQty > 10 ? 'bg-green-500/90 text-white' : 
            product.stockQty > 0 ? 'bg-yellow-500/90 text-white' : 
            'bg-red-500/90 text-white'
          }`}>
            {product.stockQty > 10 ? 'In Stock' : product.stockQty > 0 ? `${product.stockQty} left` : 'Sold Out'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {formatCurrency(product.price)}
          </span>
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map(tag => (
              <span key={tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <Button 
          onClick={() => addItem(product)}
          className="w-full py-3 font-bold rounded-2xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 border-0"
          disabled={product.stockQty === 0}
        >
          {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart ✨'}
        </Button>
      </div>
    </div>
  )
}