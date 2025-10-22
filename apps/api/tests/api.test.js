// API endpoint tests
import request from 'supertest';
import express from 'express';
import { connectDB } from '../src/db.js';

// Import routes
import customerRoutes from '../src/routes/customers.js';
import productRoutes from '../src/routes/products.js';
import orderRoutes from '../src/routes/orders.js';
import analyticsRoutes from '../src/routes/analytics.js';
import dashboardRoutes from '../src/routes/dashboard.js';
import assistantRoutes from '../src/routes/assistant.js';

// Create test app
const app = express();
app.use(express.json());
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assistant", assistantRoutes);

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await connectDB();
  });

  describe('Products API', () => {
    test('GET /api/products should return products list', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/products with search should filter results', async () => {
      const response = await request(app)
        .get('/api/products?search=headphones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/products/:id should return specific product', async () => {
      // First get a product ID
      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);

      if (productsResponse.body.data.length > 0) {
        const productId = productsResponse.body.data[0]._id;
        
        const response = await request(app)
          .get(`/api/products/${productId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(productId);
      }
    });
  });

  describe('Customers API', () => {
    test('GET /api/customers should return customers list', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/customers?email should find customer by email', async () => {
      const response = await request(app)
        .get('/api/customers?email=demo@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('demo@example.com');
    });

    test('GET /api/customers?email with non-existent email should return 404', async () => {
      const response = await request(app)
        .get('/api/customers?email=nonexistent@example.com')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Orders API', () => {
    test('GET /api/orders should return orders list', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('POST /api/orders should create new order', async () => {
      // First get a customer ID
      const customersResponse = await request(app)
        .get('/api/customers?email=demo@example.com')
        .expect(200);

      const customerId = customersResponse.body.data._id;

      // Get a product ID
      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);

      const productId = productsResponse.body.data[0]._id;

      const orderData = {
        customerId: customerId,
        items: [{
          productId: productId,
          name: 'Test Product',
          price: 29.99,
          quantity: 1
        }]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBe(customerId);
      expect(response.body.data.items).toHaveLength(1);
    });

    test('POST /api/orders with invalid data should return 400', async () => {
      const invalidOrderData = {
        customerId: 'invalid-id',
        items: []
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Analytics API', () => {
    test('GET /api/analytics/dashboard-metrics should return metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard-metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('recentActivity');
      expect(response.body.data).toHaveProperty('orderStatusBreakdown');
    });

    test('GET /api/analytics/daily-revenue should return revenue data', async () => {
      const from = '2025-01-01';
      const to = '2025-01-31';
      
      const response = await request(app)
        .get(`/api/analytics/daily-revenue?from=${from}&to=${to}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Dashboard API', () => {
    test('GET /api/dashboard/business-metrics should return business metrics', async () => {
      const response = await request(app)
        .get('/api/dashboard/business-metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('revenue');
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('customers');
    });

    test('GET /api/dashboard/performance should return performance metrics', async () => {
      const response = await request(app)
        .get('/api/dashboard/performance')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('api');
      expect(response.body.data).toHaveProperty('sse');
      expect(response.body.data).toHaveProperty('database');
    });

    test('GET /api/dashboard/health should return health status', async () => {
      const response = await request(app)
        .get('/api/dashboard/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('server');
      expect(response.body.data).toHaveProperty('overall');
    });
  });

  describe('Assistant API', () => {
    test('POST /api/assistant/chat should process message', async () => {
      const messageData = {
        message: "What is your return policy?",
        context: {}
      };

      const response = await request(app)
        .post('/api/assistant/chat')
        .send(messageData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('intent');
    });

    test('POST /api/assistant/chat with empty message should return 400', async () => {
      const response = await request(app)
        .post('/api/assistant/chat')
        .send({ message: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('GET /api/assistant/stats should return assistant statistics', async () => {
      const response = await request(app)
        .get('/api/assistant/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalQueries');
      expect(response.body.data).toHaveProperty('intentDistribution');
    });
  });

  describe('Error Handling', () => {
    test('GET /api/products/invalid-id should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid');
    });

    test('GET /api/products/nonexistent-id should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });
});
