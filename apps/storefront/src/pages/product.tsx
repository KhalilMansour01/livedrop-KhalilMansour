import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Product } from '../lib/api'
import { api } from '../lib/api'
import { Button } from '../components/atoms/button'
import { ProductCard } from '../components/molecules/product-card'
import { formatCurrency } from '../lib/format'
import { useCartStore } from '../lib/store'

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const productData = await api.getProduct(id)
        setProduct(productData || null)
        
        if (productData) {
          // Load related products (same tags)
          const allProducts = await api.listProducts()
          const related = allProducts
            .filter(p => p.id !== id && p.tags.some(tag => productData.tags.includes(tag)))
            .slice(0, 3)
          setRelatedProducts(related)
        }
      }
    }
    loadProduct()
  }, [id])

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Product not found</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
        ← Back to Catalog
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-96 object-cover"
            />
          </div>
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">
                {formatCurrency(product.price)}
              </span>
              <div className={`mt-2 ${product.stockQty > 5 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stockQty > 5 ? `${product.stockQty} in stock` : `Only ${product.stockQty} left!`}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={() => addItem(product)}
              size="lg"
              className="w-full"
              disabled={product.stockQty === 0}
            >
              {product.stockQty === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductPage