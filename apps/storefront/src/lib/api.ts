import productsData from '../../public/mock-catalog.json';

const products = productsData as Product[];

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  tags: string[];
  stockQty: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: 'Placed' | 'Packed' | 'Shipped' | 'Delivered';
  items: CartItem[];
  total: number;
  carrier?: string;
  eta?: string;
}

// Mock orders storage
const mockOrders = new Map<string, Order>();

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  listProducts: async (): Promise<Product[]> => {
    await delay(200);
    return Promise.resolve(products);
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    await delay(100);
    return Promise.resolve(products.find(p => p.id === id));
  },

  getOrderStatus: async (id: string): Promise<Order | undefined> => {
    await delay(150);
    const order = mockOrders.get(id);
    
    // Simulate order progression
    if (order && order.status === 'Placed') {
      // 30% chance to progress order status
      if (Math.random() > 0.7) {
        order.status = 'Packed';
        order.carrier = 'FastShip';
        order.eta = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    }
    
    return Promise.resolve(order);
  },

  placeOrder: async (items: CartItem[]): Promise<{ orderId: string }> => {
    await delay(300);
    const orderId = 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    const order: Order = {
      id: orderId,
      status: 'Placed',
      items: [...items],
      total
    };
    
    mockOrders.set(orderId, order);
    return Promise.resolve({ orderId });
  }
};
