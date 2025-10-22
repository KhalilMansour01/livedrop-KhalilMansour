# ShopLite API - Week 5 MVP Backend

A complete e-commerce API with real-time features, intelligent assistant, and comprehensive analytics.

## Features

- **RESTful API** with MongoDB Atlas integration
- **Real-time Order Tracking** via Server-Sent Events (SSE)
- **Intelligent Support Assistant** with intent detection and function calling
- **Comprehensive Analytics** with database aggregation
- **Admin Dashboard** with business metrics and performance monitoring
- **Auto-simulated Order Progression** for testing

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- ngrok account (for LLM integration)

### Installation

1. **Clone and install dependencies:**
```bash
cd apps/api
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and LLM endpoint
```

3. **Start the server:**
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## API Endpoints

### Products
- `GET /api/products` - List products with filtering
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create product (admin)

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers?email=user@example.com` - Find customer by email
- `GET /api/customers/:id` - Get customer by ID

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `GET /api/orders/:id/stream` - **SSE endpoint for real-time tracking**

### Analytics
- `GET /api/analytics/daily-revenue` - Daily revenue with date range
- `GET /api/analytics/dashboard-metrics` - Overview metrics
- `GET /api/analytics/product-metrics` - Product performance

### Dashboard
- `GET /api/dashboard/business-metrics` - Business KPIs
- `GET /api/dashboard/performance` - System performance
- `GET /api/dashboard/assistant-stats` - Assistant analytics
- `GET /api/dashboard/health` - System health check

### Assistant
- `POST /api/assistant/chat` - Chat with intelligent assistant
- `GET /api/assistant/stats` - Assistant statistics
- `POST /api/assistant/validate-citations` - Validate citations

## Real-Time Features

### Server-Sent Events (SSE)
The API includes auto-simulated order progression for testing:

```javascript
// Connect to order tracking
const eventSource = new EventSource('/api/orders/ORDER_ID/stream');

eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Order status:', update.status);
  // Updates: PENDING → PROCESSING → SHIPPED → DELIVERED
};
```

**Auto-Progression:**
- `PENDING` → wait 3-5s → `PROCESSING`
- `PROCESSING` → wait 5-7s → `SHIPPED` 
- `SHIPPED` → wait 5-7s → `DELIVERED`

## Intelligent Assistant

### Intent Detection
The assistant classifies user input into 7 categories:
- `policy_question` - Policy and FAQ queries
- `order_status` - Order tracking requests
- `product_search` - Product recommendations
- `complaint` - Customer complaints
- `chitchat` - Greetings and small talk
- `off_topic` - Unrelated queries
- `violation` - Inappropriate content

### Function Calling
The assistant can execute functions:
- `getOrderStatus(orderId)` - Check order status
- `searchProducts(query, limit)` - Search products
- `getCustomerOrders(email)` - Get customer orders

### Knowledge Base
Uses `docs/ground-truth.json` with 15 policy documents:
- Return policies
- Shipping information
- Warranty details
- Privacy policies
- Payment methods

## Database Schema

### Collections

**customers**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

**products**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  tags: [String],
  imageUrl: String,
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**orders**
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: String, // PENDING, PROCESSING, SHIPPED, DELIVERED
  carrier: String,
  estimatedDelivery: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Seeding Data

The API includes comprehensive seed data:

```bash
npm run seed
```

**Seed Data:**
- **12 customers** including `demo@example.com`
- **30 products** across multiple categories
- **20 orders** with various statuses
- **Realistic data** with proper relationships

## Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- **API Tests** - All endpoints and error handling
- **Assistant Tests** - Intent detection and function calling
- **Integration Tests** - End-to-end workflows

### Test Categories
1. **Complete Purchase Flow** - Browse → Add to Cart → Checkout → Track
2. **Support Interaction Flow** - Policy questions → Order status → Complaints
3. **Multi-Intent Conversation** - Chitchat → Product search → Policy → Order status

## Environment Variables

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shoplite

# Server
PORT=4000
NODE_ENV=development

# LLM Integration
LLM_ENDPOINT=http://your-ngrok-url.ngrok.io/generate

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Deployment

### Render.com (Recommended)
1. Connect GitHub repository
2. Set root directory to `apps/api`
3. Add environment variables
4. Deploy automatically

### Railway.app (Alternative)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Demo Users

Available test users:
- `demo@example.com` - Main demo user
- `sarah.j@example.com` - Secondary user
- `michael.chen@example.com` - Another test user

## Health Check

Visit the root endpoint for system status:
```
GET /
```

Response:
```json
{
  "message": "🚀 Shoplite API is running!",
  "database": "MongoDB Atlas Connected",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "endpoints": [...]
}
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MongoDB       │
│   (Vercel)      │◄──►│   (Render)       │◄──►│   Atlas         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         │              │   LLM Service   │
         └──────────────►│   (Colab+ngrok) │
                        └─────────────────┘
```

## Support

For issues or questions:
1. Check the health endpoint
2. Review server logs
3. Verify environment variables
4. Test database connectivity
5. Check LLM service status

## License

MIT License - See LICENSE file for details.
