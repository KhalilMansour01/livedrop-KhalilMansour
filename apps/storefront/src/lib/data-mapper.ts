// Data mapper to convert between old mock structure and new API structure
import type { Product, Order } from './api';

// Convert API Product to old structure for compatibility
export const mapProduct = (apiProduct: Product) => ({
  id: apiProduct._id,
  title: apiProduct.name,
  image: apiProduct.imageUrl,
  stockQty: apiProduct.stock,
  description: apiProduct.description,
  price: apiProduct.price,
  category: apiProduct.category,
  tags: apiProduct.tags
});

// Convert API Order to old structure for compatibility
export const mapOrder = (apiOrder: Order) => ({
  id: apiOrder._id,
  status: apiOrder.status,
  items: apiOrder.items.map(item => ({
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      image: '/images/default.jpg' // Default image
    },
    quantity: item.quantity
  })),
  total: apiOrder.total,
  carrier: apiOrder.carrier,
  eta: apiOrder.estimatedDelivery,
  createdAt: apiOrder.createdAt,
  updatedAt: apiOrder.updatedAt
});

// Convert old structure to API structure
export const mapToAPIProduct = (oldProduct: any): Product => ({
  _id: oldProduct.id,
  name: oldProduct.title,
  description: oldProduct.description,
  price: oldProduct.price,
  category: oldProduct.category,
  tags: oldProduct.tags,
  imageUrl: oldProduct.image,
  stock: oldProduct.stockQty
});
