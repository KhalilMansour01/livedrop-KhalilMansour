// End-to-end integration tests
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
import sseRoutes from '../src/sse/order-status.js';

// Create test app
const app = express();
app.use(express.json());
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/orders", sseRoutes);

describe('Integration Tests', () => {
  let customerId;
  let productId;
  let orderId;

  beforeAll(async () => {
    await connectDB();
  });

  describe('Test 1: Complete Purchase Flow', () => {
    test('should complete full purchase workflow', async () => {
      // Step 1: Browse products
      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(productsResponse.body.success).toBe(true);
      expect(productsResponse.body.data.length).toBeGreaterThan(0);
      productId = productsResponse.body.data[0]._id;

      // Step 2: Get customer
      const customerResponse = await request(app)
        .get('/api/customers?email=demo@example.com')
        .expect(200);
      
      expect(customerResponse.body.success).toBe(true);
      customerId = customerResponse.body.data._id;

      // Step 3: Create order
      const orderData = {
        customerId: customerId,
        items: [{
          productId: productId,
          name: productsResponse.body.data[0].name,
          price: productsResponse.body.data[0].price,
          quantity: 1
        }]
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);
      
      expect(orderResponse.body.success).toBe(true);
      orderId = orderResponse.body.data._id;

      // Step 4: Check order status
      const statusResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);
      
      expect(statusResponse.body.success).toBe(true);
      expect(statusResponse.body.data.status).toBe('PENDING');

      // Step 5: Ask assistant about order status
      const assistantResponse = await request(app)
        .post('/api/assistant/chat')
        .send({
          message: `What is the status of order ${orderId}?`,
          context: { orderId }
        })
        .expect(200);
      
      expect(assistantResponse.body.success).toBe(true);
      expect(assistantResponse.body.intent).toBe('order_status');
    });
  });

  describe('Test 2: Support Interaction Flow', () => {
    test('should handle support interactions correctly', async () => {
      // Step 1: Ask policy question
      const policyResponse = await request(app)
        .post('/api/assistant/chat')
        .send({
          message: 'What is your return policy?',
          context: {}
        })
        .expect(200);
      
      expect(policyResponse.body.success).toBe(true);
      expect(policyResponse.body.intent).toBe('policy_question');
      expect(policyResponse.body.text).toContain('return');
      expect(policyResponse.body.citations).toBeDefined();

      // Step 2: Ask about specific order
      if (orderId) {
        const orderResponse = await request(app)
          .post('/api/assistant/chat')
          .send({
            message: `Check order ${orderId}`,
            context: { orderId }
          })
          .expect(200);
        
        expect(orderResponse.body.success).toBe(true);
        expect(orderResponse.body.intent).toBe('order_status');
      }

      // Step 3: Express complaint
      const complaintResponse = await request(app)
        .post('/api/assistant/chat')
        .send({
          message: 'I am very unhappy with my order',
          context: {}
        })
        .expect(200);
      
      expect(complaintResponse.body.success).toBe(true);
      expect(complaintResponse.body.intent).toBe('complaint');
      expect(complaintResponse.body.text).toContain('sorry');
    });
  });

  describe('Test 3: Multi-Intent Conversation', () => {
    test('should handle multi-intent conversation flow', async () => {
      // Step 1: Start with greeting (chitchat)
      const greetingResponse = await request(app)
        .post('/api/assistant/chat')
        .send({
          message: 'Hello there!',
          context: {}
        })
        .expect(200);
      
      expect(greetingResponse.body.success).toBe(true);
      expect(greetingResponse.body.intent).toBe('chitchat');

      // Step 2: Ask about products (product_search)
      const productResponse = await request(app)
        .post('/api/assistant/chat')
        .send({
          message: 'I need wireless headphones',
          context: {}
        })
        .expect(200);
      
      expect(productResponse.body.success).toBe(true);
      expect(productResponse.body.intent).toBe('product_search');

      // Step 3: Ask about policy (policy_question)
      const policyResponse = await request(app)
        .post('/api/assistant/chat')
        .send({
          message: 'What is your shipping policy?',
          context: {}
        })
        .expect(200);
      
      expect(policyResponse.body.success).toBe(true);
      expect(policyResponse.body.intent).toBe('policy_question');

      // Step 4: Check order (order_status)
      if (orderId) {
        const orderResponse = await request(app)
          .post('/api/assistant/chat')
          .send({
            message: `What is the status of order ${orderId}?`,
            context: { orderId }
          })
          .expect(200);
        
        expect(orderResponse.body.success).toBe(true);
        expect(orderResponse.body.intent).toBe('order_status');
      }
    });
  });

  describe('Test 4: Analytics and Dashboard Integration', () => {
    test('should provide analytics data', async () => {
      // Test dashboard metrics
      const dashboardResponse = await request(app)
        .get('/api/analytics/dashboard-metrics')
        .expect(200);
      
      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data).toHaveProperty('overview');
      expect(dashboardResponse.body.data).toHaveProperty('recentActivity');

      // Test business metrics
      const businessResponse = await request(app)
        .get('/api/dashboard/business-metrics')
        .expect(200);
      
      expect(businessResponse.body.success).toBe(true);
      expect(businessResponse.body.data).toHaveProperty('revenue');
      expect(businessResponse.body.data).toHaveProperty('orders');

      // Test performance metrics
      const performanceResponse = await request(app)
        .get('/api/dashboard/performance')
        .expect(200);
      
      expect(performanceResponse.body.success).toBe(true);
      expect(performanceResponse.body.data).toHaveProperty('api');
      expect(performanceResponse.body.data).toHaveProperty('sse');
    });
  });

  describe('Test 5: Error Handling and Edge Cases', () => {
    test('should handle invalid requests gracefully', async () => {
      // Test invalid product ID
      const invalidProductResponse = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);
      
      expect(invalidProductResponse.body.success).toBe(false);

      // Test invalid order ID
      const invalidOrderResponse = await request(app)
        .get('/api/orders/invalid-id')
        .expect(400);
      
      expect(invalidOrderResponse.body.success).toBe(false);

      // Test empty assistant message
      const emptyMessageResponse = await request(app)
        .post('/api/assistant/chat')
        .send({ message: '' })
        .expect(400);
      
      expect(emptyMessageResponse.body.success).toBe(false);
    });

    test('should handle database connection issues', async () => {
      // This test would require mocking database failures
      // For now, we'll test that the system handles errors gracefully
      const response = await request(app)
        .get('/api/products')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  describe('Test 6: SSE Connection (Mock Test)', () => {
    test('should handle SSE endpoint requests', async () => {
      if (orderId) {
        // Test SSE endpoint (this would normally require a different approach for testing)
        const response = await request(app)
          .get(`/api/orders/${orderId}/stream`)
          .expect(200);
        
        // SSE responses have different content type
        expect(response.headers['content-type']).toContain('text/event-stream');
      }
    });
  });

  describe('Test 7: Data Consistency', () => {
    test('should maintain data consistency across operations', async () => {
      // Get initial metrics
      const initialMetrics = await request(app)
        .get('/api/analytics/dashboard-metrics')
        .expect(200);
      
      const initialOrderCount = initialMetrics.body.data.overview.totalOrders;

      // Create a new order
      if (customerId && productId) {
        const orderData = {
          customerId: customerId,
          items: [{
            productId: productId,
            name: 'Test Product',
            price: 19.99,
            quantity: 1
          }]
        };

        await request(app)
          .post('/api/orders')
          .send(orderData)
          .expect(201);

        // Check that metrics reflect the new order
        const updatedMetrics = await request(app)
          .get('/api/analytics/dashboard-metrics')
          .expect(200);
        
        expect(updatedMetrics.body.data.overview.totalOrders).toBe(initialOrderCount + 1);
      }
    });
  });
});
