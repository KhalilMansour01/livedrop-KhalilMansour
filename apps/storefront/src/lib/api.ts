// Real API client for Week 5 - connects to backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  carrier?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to handle API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

export const api = {
  // Product endpoints
  listProducts: async (search?: string, category?: string, sort?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    
    const queryString = params.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    const products = await apiCall<Product[]>(endpoint);
    // Convert to old format for compatibility
    return products.map(p => ({
      id: p._id,
      title: p.name,
      image: p.imageUrl,
      stockQty: p.stock,
      description: p.description,
      price: p.price,
      category: p.category,
      tags: p.tags
    }));
  },

  getProduct: async (id: string): Promise<any> => {
    const product = await apiCall<Product>(`/api/products/${id}`);
    // Convert to old format for compatibility
    return {
      id: product._id,
      title: product.name,
      image: product.imageUrl,
      stockQty: product.stock,
      description: product.description,
      price: product.price,
      category: product.category,
      tags: product.tags
    };
  },

  // Customer endpoints
  getCustomerByEmail: async (email: string): Promise<Customer> => {
    return apiCall<Customer>(`/api/customers?email=${encodeURIComponent(email)}`);
  },

  // Order endpoints
  getOrderStatus: async (id: string): Promise<any> => {
    const order = await apiCall<Order>(`/api/orders/${id}`);
    // Convert to old format for compatibility
    return {
      id: order._id,
      status: order.status,
      items: order.items.map(item => ({
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          image: '/images/default.jpg'
        },
        quantity: item.quantity
      })),
      total: order.total,
      carrier: order.carrier,
      eta: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
  },

  placeOrder: async (customerId: string, items: CartItem[], shippingAddress?: any): Promise<{ orderId: string }> => {
    const orderData = {
      customerId,
      items: items.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      shippingAddress
    };

    const order = await apiCall<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    return { orderId: order._id };
  },

  // Analytics endpoints
  getDailyRevenue: async (from: string, to: string) => {
    return apiCall(`/api/analytics/daily-revenue?from=${from}&to=${to}`);
  },

  getDashboardMetrics: async () => {
    return apiCall('/api/analytics/dashboard-metrics');
  },

  // Business metrics for admin dashboard
  getBusinessMetrics: async () => {
    return apiCall('/api/dashboard/business-metrics');
  },

  getPerformanceMetrics: async () => {
    return apiCall('/api/dashboard/performance');
  },

  getAssistantStats: async () => {
    return apiCall('/api/dashboard/assistant-stats');
  },

  // Health check
  getHealth: async () => {
    return apiCall('/api/dashboard/health');
  }
};
