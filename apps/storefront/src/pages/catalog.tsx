import React, { useState, useEffect } from 'react'
import type { Product } from '../lib/api'
import { api } from '../lib/api'
import { ProductCard } from '../components/molecules/product-card'
import { Input } from '../components/atoms/input'

const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<'price-asc' | 'price-desc'>('price-asc')
    const [selectedTag, setSelectedTag] = useState<string>('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadProducts = async () => {
            const data = await api.listProducts()
            setProducts(data)
            setFilteredProducts(data)
            setLoading(false)
        }
        loadProducts()
    }, [])

    useEffect(() => {
        let filtered = products

        if (search) {
            const searchLower = search.toLowerCase()
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(searchLower) ||
                product.tags.some(tag => tag.toLowerCase().includes(searchLower))
            )
        }

        if (selectedTag !== 'all') {
            filtered = filtered.filter(product => product.tags.includes(selectedTag))
        }

        filtered = [...filtered].sort((a, b) => {
            if (sort === 'price-asc') return a.price - b.price
            return b.price - a.price
        })

        setFilteredProducts(filtered)
    }, [products, search, sort, selectedTag])

    const allTags = Array.from(new Set(products.flatMap(p => p.tags)))

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="text-center mb-16">
                <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl px-8 py-4 mb-6 shadow-2xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Discover Elegance
                    </h1>
                    <p className="text-purple-100 text-lg opacity-90">
                        Curated collection of premium products
                    </p>
                </div>
            </div>
            <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <Input
                            type="search"
                            placeholder="Search products..."
                            value={search}
                            onChange={setSearch}
                            className="w-full"
                        />
                    </div>

                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as 'price-asc' | 'price-desc')}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>

                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">All Categories</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    )
}

export default Catalog