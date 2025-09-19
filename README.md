# Live Drops System Design

## Diagrams & Sketches
All key visual artifacts for this project are available in a single Excalidraw link:  
- **Architecture Diagram**  
- **Data Model Sketches**  
- **API Contract Outline**  

View them here: [Excalidraw - Live Drops](https://excalidraw.com/#json=0DBMYh5jCs1Wxf_eXw8n0,XKt7kgeDZyj9T3NUq8BOjw).

This project designs **Live Drops**, a flash-sale platform where creators run limited-inventory drops and users get real-time updates.  
It uses a **microservices architecture** for scalability, reliability, and low latency, with Redis as the core component for real-time operations and inventory management.

---

## System Architecture

The system follows a layered microservices approach:

### Client Layer
- **Web Browsers** and **Mobile Apps** connect via:
  - **API Gateway** (for standard REST/GraphQL requests)
  - **WebSocket Gateway** (for real-time notifications)

### API Layer
- **API Gateway**
  - Single public entry point
  - Handles authentication, rate limiting, and request routing
  - Provides a unified API while backend is decomposed into microservices
- **WebSocket Gateway**
  - Manages persistent connections
  - Pushes real-time updates for stock changes, new drops, and order confirmations

### Service Layer
- **Auth Service:** JWT-based user authentication and authorization  
- **Product Service:** CRUD for products and drops; handles browsing and search requests  
- **Follow Service:** Social graph management (follow/unfollow, queries for followers/following)  
- **Order Service:** Processes orders, deducts inventory, ensures idempotency  
- **Notification Service:** Listens to events and pushes notifications via WebSocket or Push

### Data Layer
- **Redis (Cache):** Hot inventory counts, sessions, feeds, and idempotency keys  
- **PostgreSQL (Primary DB):** Source of truth for users, orders, products, and drops. Sharded by user_id or creator_id  
- **Cassandra (NoSQL):** Social graph storage for scalable follow relationships  
- **Elasticsearch:** Product search and filtering for browsing  
- **Kafka (Message Queue):** Decouples services, handles event-driven workflows  

---

## Data Model

### Core SQL Schema (PostgreSQL)
- **Users & Creators:** User profiles and extended creator information  
- **Products:** Core product information  
- **Drops:** Timed events with inventory counters  
- **Orders:** Transaction records with unique idempotency keys  
- **Follows:** Relationships between users and creators  

### NoSQL & Cache Schema
- **Redis**
  - `drop:{dropId}:stock` — current inventory  
  - `user:{userId}:feed` — sorted set of drop IDs for personalized feed  
  - `idempotency:{key}` — prevents duplicate order processing  
- **Cassandra**
  - `followers:{creatorId}` — set of follower user IDs  
  - `following:{userId}` — set of followed creator IDs  

---

## API Design

### Public REST API
- `POST /auth/login` — User authentication  
- `GET /drops/live` — List live drops  
- `POST /creators/{id}/follow` — Follow a creator  
- `POST /drops/{id}/orders` — Place an order (idempotency key in header)  

### GraphQL
- `POST /graphql` — Fetch multiple related resources in one request  

### WebSocket
- `wss://api.livedrop.com/notifications` — Receive real-time notifications for:
  - New drops from followed creators  
  - Stock updates for watched drops  
  - Order confirmations  

### Internal APIs
- `POST /internal/orders` — Exposed by Order Service for API Gateway calls  
- `POST /internal/notifications` — Notification Service consumes events from Kafka  

---

## Caching Strategy

1. **Cache-Aside (Lazy Loading) for Product Data**
   - Product Service checks Redis first, falls back to DB if missing
   - TTL of 5 minutes; active invalidation on product updates

2. **Write-Through Cache for Inventory**
   - Order Service treats Redis as authoritative during live drops
   - Atomic DECRBY operations ensure stock cannot go negative
   - PostgreSQL updated asynchronously; stock key deleted on drop completion

3. **Write-Behind Cache for Social Graph**
   - Follow Service writes new relationships to Redis, then asynchronously to Cassandra
   - `user:{userId}:feed` invalidated whenever a followed creator starts a drop

4. **Idempotency Key Caching**
   - Unique client-provided keys stored in Redis with 24h TTL  

---

## Key Design Decisions and Tradeoffs

| Decision | Rationale | Tradeoff |
|----------|-----------|----------|
| Emphasis on Redis | Redis handles real-time updates, inventory consistency, high throughput | May give impression SQL/NoSQL are less important; mitigated by explanations |
| Polyglot Persistence | Right tool for each job: PostgreSQL, Cassandra, Elasticsearch, Redis | Increases operational complexity; requires multi-tech expertise |
| Redis-based Inventory | Prevents overselling under high concurrency | Potential consistency gap if Redis fails before DB update; mitigated with reconciliation jobs |
| Client-managed Idempotency Keys | Simplifies server logic | Client must correctly generate unique IDs |
| Event-driven Architecture (Kafka) | Decouples services, ensures reliability | Adds complexity and potential failure points |
| WebSockets for Real-time Updates | Low-latency communication for “flash sale” feel | More complex connection management |
