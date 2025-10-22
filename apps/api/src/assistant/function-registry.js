// Function Registry System
// Manages and executes assistant functions

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

export class FunctionRegistry {
  constructor() {
    this.functions = new Map();
    this.registerDefaultFunctions();
  }

  // Register a new function
  register(name, schema, handler) {
    this.functions.set(name, {
      schema,
      handler,
      callCount: 0,
      lastCalled: null
    });
  }

  // Get all function schemas
  getAllSchemas() {
    const schemas = {};
    for (const [name, func] of this.functions) {
      schemas[name] = func.schema;
    }
    return schemas;
  }

  // Execute a function
  async execute(name, parameters) {
    const func = this.functions.get(name);
    if (!func) {
      throw new Error(`Function ${name} not found`);
    }

    try {
      // Update call statistics
      func.callCount++;
      func.lastCalled = new Date();

      // Execute the function
      const result = await func.handler(parameters);
      
      return {
        success: true,
        result,
        functionName: name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Function ${name} execution error:`, error);
      return {
        success: false,
        error: error.message,
        functionName: name,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get function statistics
  getStats() {
    const stats = {};
    for (const [name, func] of this.functions) {
      stats[name] = {
        callCount: func.callCount,
        lastCalled: func.lastCalled
      };
    }
    return stats;
  }

  // Register default functions
  registerDefaultFunctions() {
    // Get Order Status Function
    this.register('getOrderStatus', {
      name: 'getOrderStatus',
      description: 'Get the status and details of a specific order',
      parameters: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            description: 'The order ID to look up'
          }
        },
        required: ['orderId']
      }
    }, async (params) => {
      const { orderId } = params;
      
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const order = await Order.findById(orderId)
        .populate('customerId', 'name email')
        .populate('items.productId', 'name imageUrl');

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        orderId: order._id,
        status: order.status,
        total: order.total,
        customer: {
          name: order.customerId.name,
          email: order.customerId.email
        },
        items: order.items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.productId?.imageUrl
        })),
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    // Search Products Function
    this.register('searchProducts', {
      name: 'searchProducts',
      description: 'Search for products based on query and filters',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for products'
          },
          category: {
            type: 'string',
            description: 'Product category filter'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 10
          }
        },
        required: ['query']
      }
    }, async (params) => {
      const { query, category, limit = 10 } = params;
      
      if (!query) {
        throw new Error('Search query is required');
      }

      let searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      };

      if (category) {
        searchQuery.category = category.toLowerCase();
      }

      const products = await Product.find(searchQuery)
        .limit(parseInt(limit))
        .select('name description price category imageUrl stock tags');

      return {
        query,
        category,
        results: products.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          stock: product.stock,
          tags: product.tags
        })),
        total: products.length
      };
    });

    // Get Customer Orders Function
    this.register('getCustomerOrders', {
      name: 'getCustomerOrders',
      description: 'Get all orders for a specific customer',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Customer email address'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of orders to return',
            default: 10
          }
        },
        required: ['email']
      }
    }, async (params) => {
      const { email, limit = 10 } = params;
      
      if (!email) {
        throw new Error('Customer email is required');
      }

      // Find customer by email
      const customer = await Customer.findOne({ email: email.toLowerCase() });
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Get customer orders
      const orders = await Order.find({ customerId: customer._id })
        .populate('items.productId', 'name imageUrl')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      return {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email
        },
        orders: orders.map(order => ({
          id: order._id,
          status: order.status,
          total: order.total,
          items: order.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.productId?.imageUrl
          })),
          carrier: order.carrier,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt
        })),
        total: orders.length
      };
    });
  }

  // Get function by name
  getFunction(name) {
    return this.functions.get(name);
  }

  // Check if function exists
  hasFunction(name) {
    return this.functions.has(name);
  }

  // Get all function names
  getFunctionNames() {
    return Array.from(this.functions.keys());
  }
}

export default FunctionRegistry;
