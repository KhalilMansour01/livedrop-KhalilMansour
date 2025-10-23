// Real API client for Week 5 - connects to backend API
const API_BASE_URL = 
// (import.meta as any).env.VITE_API_URL || 
'http://localhost:4000';

// Backend Schema Types (from MongoDB)
export interface ProductSchema {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
  stock: number;
}

export interface OrderSchema {
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

export interface CustomerSchema {
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
  createdAt: string;
  updatedAt: string;
}

// Frontend Compatible Types (what your components expect)
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  image: string;
  stockQty: number;
}

export interface Order {
  _id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      title?: string;
    };
    quantity: number;
  }>;
  total: number;
  carrier?: string;
  eta?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
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

// Convert backend product to frontend format
function convertProduct(product: ProductSchema): Product {
  return {
    _id: product._id,
    title: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    tags: product.tags,
    image: product.imageUrl,
    stockQty: product.stock
  };
}

// Convert backend order to frontend format  
function convertOrder(order: OrderSchema): Order {
  return {
    _id: order._id,
    status: order.status,
    items: order.items.map(item => ({
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: '/images/default.jpg',
        title: item.name
      },
      quantity: item.quantity
    })),
    total: order.total,
    carrier: order.carrier,
    eta: order.estimatedDelivery,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
}

export const api = {
  // Product endpoints
  listProducts: async (search?: string, category?: string, sort?: string): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (sort) params.append('sort', sort);
  
  const queryString = params.toString();
  const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
  
  console.log('🔄 Fetching products from:', `${API_BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('📦 Raw API response:', result);
    
    // Handle different response formats
    let productsData;
    if (result.success !== undefined) {
      // Backend returns { success: true, data: [...] }
      productsData = result.data;
    } else if (Array.isArray(result)) {
      // Backend returns direct array
      productsData = result;
    } else {
      throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
    }
    
    if (!Array.isArray(productsData)) {
      throw new Error(`Products data is not an array: ${typeof productsData}`);
    }
    
    // Convert to frontend format
    const convertedProducts = productsData.map((p: any) => ({
      _id: p._id || p.id,
      title: p.name || p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      tags: p.tags || [],
      image: p.imageUrl || p.image,
      stockQty: p.stock || p.stockQty
    }));
    
    console.log('✅ Converted products:', convertedProducts);
    return convertedProducts;
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
},

  getProduct: async (id: string): Promise<Product> => {
    const product = await apiCall<ProductSchema>(`/api/products/${id}`);
    return convertProduct(product);
  },

  // Order endpoints
  getOrderStatus: async (id: string): Promise<Order> => {
    const order = await apiCall<OrderSchema>(`/api/orders/${id}`);
    return convertOrder(order);
  },

  placeOrder: async (customerEmail: string, items: CartItem[], shippingAddress?: any): Promise<{ orderId: string }> => {
    const orderData = {
      customerId: customerEmail,
      items: items.map(item => ({
        productId: item.product._id,
        name: item.product.title,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      shippingAddress
    };

    const order = await apiCall<OrderSchema>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    return { orderId: order._id };
  },

  // Customer endpoints
  getCustomerByEmail: async (email: string): Promise<Customer> => {
    const customer = await apiCall<CustomerSchema>(`/api/customers?email=${encodeURIComponent(email)}`);
    return {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    };
  },

  // Analytics endpoints
  getDailyRevenue: async (from: string, to: string) => {
    return apiCall(`/api/analytics/daily-revenue?from=${from}&to=${to}`);
  },

  getDashboardMetrics: async () => {
    return apiCall('/api/analytics/dashboard-metrics');
  },

  getBusinessMetrics: async () => {
    return apiCall('/api/dashboard/business-metrics');
  },

  getPerformanceMetrics: async () => {
    return apiCall('/api/dashboard/performance');
  },

  getAssistantStats: async () => {
    return apiCall('/api/dashboard/assistant-stats');
  },

  getHealth: async () => {
    return apiCall('/api/dashboard/health');
  }
};