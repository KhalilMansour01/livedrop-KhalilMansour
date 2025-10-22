import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

// Import routes
import customerRoutes from "./routes/customers.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import analyticsRoutes from "./routes/analytics.js";
import dashboardRoutes from "./routes/dashboard.js";
import assistantRoutes from "./routes/assistant.js";
import sseRoutes from "./sse/order-status.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to database (will use mock mode if MongoDB fails)
const dbConnected = await connectDB();

// Routes
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/orders", sseRoutes); // SSE routes for order streaming

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "🚀 Shoplite API is running!",
    database: dbConnected ? "MongoDB Atlas Connected" : "Mock Mode (MongoDB connection failed)",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET  /api/customers",
      "GET  /api/products", 
      "GET  /api/orders",
      "POST /api/orders",
      "GET  /api/orders/:id/stream (SSE)",
      "GET  /api/analytics/*",
      "GET  /api/dashboard/*"
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/`);
  console.log(`👥 Customers: http://localhost:${PORT}/api/customers`);
  console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
  console.log(`📦 Orders: http://localhost:${PORT}/api/orders`);
});