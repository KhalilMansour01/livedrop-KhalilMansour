import express from "express";
import Order from "../models/Order.js";
import { getActiveConnectionsCount } from "../sse/order-status.js";

const router = express.Router();

// Business metrics for admin dashboard
router.get("/business-metrics", async (req, res) => {
  try {
    // Calculate key business metrics using aggregation
    const [revenueMetrics, orderMetrics, customerMetrics] = await Promise.all([
      // Revenue metrics
      Order.aggregate([
        {
          $match: { status: { $in: ["PROCESSING", "SHIPPED", "DELIVERED"] } }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            avgOrderValue: { $avg: "$total" },
            minOrderValue: { $min: "$total" },
            maxOrderValue: { $max: "$total" }
          }
        }
      ]),
      
      // Order metrics
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["PROCESSING", "SHIPPED", "DELIVERED"]] },
                  1,
                  0
                ]
              }
            },
            pendingOrders: {
              $sum: {
                $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
              }
            }
          }
        }
      ]),
      
      // Customer metrics
      Order.aggregate([
        {
          $group: {
            _id: "$customerId",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$total" }
          }
        },
        {
          $group: {
            _id: null,
            uniqueCustomers: { $sum: 1 },
            avgOrdersPerCustomer: { $avg: "$orderCount" },
            avgSpendingPerCustomer: { $avg: "$totalSpent" }
          }
        }
      ])
    ]);

    const revenue = revenueMetrics[0] || {};
    const orders = orderMetrics[0] || {};
    const customers = customerMetrics[0] || {};

    res.json({
      success: true,
      data: {
        revenue: {
          total: Math.round((revenue.totalRevenue || 0) * 100) / 100,
          average: Math.round((revenue.avgOrderValue || 0) * 100) / 100,
          range: {
            min: Math.round((revenue.minOrderValue || 0) * 100) / 100,
            max: Math.round((revenue.maxOrderValue || 0) * 100) / 100
          }
        },
        orders: {
          total: orders.totalOrders || 0,
          completed: orders.completedOrders || 0,
          pending: orders.pendingOrders || 0,
          completionRate: orders.totalOrders > 0 
            ? Math.round(((orders.completedOrders || 0) / orders.totalOrders) * 100) 
            : 0
        },
        customers: {
          unique: customers.uniqueCustomers || 0,
          avgOrdersPerCustomer: Math.round((customers.avgOrdersPerCustomer || 0) * 100) / 100,
          avgSpendingPerCustomer: Math.round((customers.avgSpendingPerCustomer || 0) * 100) / 100
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Business metrics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch business metrics"
    });
  }
});

// Performance metrics
router.get("/performance", async (req, res) => {
  try {
    // Get SSE active connections count
    const activeSSEConnections = getActiveConnectionsCount();

    // Calculate API response time (simplified - in production you'd track this properly)
    const startTime = Date.now();
    
    // Simulate some database operations to measure response time
    await Order.countDocuments();
    
    const responseTime = Date.now() - startTime;

    // Get recent error count (simplified - in production you'd track this properly)
    const recentErrors = 0; // Placeholder

    res.json({
      success: true,
      data: {
        api: {
          averageResponseTime: responseTime,
          recentErrors,
          uptime: process.uptime()
        },
        sse: {
          activeConnections: activeSSEConnections
        },
        database: {
          connectionStatus: "connected", // You could check actual DB connection status
          lastQueryTime: responseTime
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Performance metrics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance metrics"
    });
  }
});

// Assistant analytics (placeholder for now)
router.get("/assistant-stats", async (req, res) => {
  try {
    // In a real implementation, you'd track these metrics
    // For now, return mock data
    res.json({
      success: true,
      data: {
        queries: {
          total: 0,
          today: 0,
          lastHour: 0
        },
        intents: {
          policy_question: 0,
          order_status: 0,
          product_search: 0,
          complaint: 0,
          chitchat: 0,
          off_topic: 0,
          violation: 0
        },
        functions: {
          getOrderStatus: 0,
          searchProducts: 0,
          getCustomerOrders: 0
        },
        performance: {
          averageResponseTime: 0,
          successRate: 100
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Assistant stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch assistant statistics"
    });
  }
});

// System health check
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    let dbStatus = "disconnected";
    try {
      await Order.countDocuments();
      dbStatus = "connected";
    } catch (dbError) {
      dbStatus = "error";
    }

    // Check LLM service status (placeholder)
    const llmStatus = "unknown"; // You'd check your Colab/ngrok status here

    res.json({
      success: true,
      data: {
        database: {
          status: dbStatus,
          lastChecked: new Date().toISOString()
        },
        llm: {
          status: llmStatus,
          lastChecked: new Date().toISOString()
        },
        server: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        },
        overall: dbStatus === "connected" ? "healthy" : "degraded"
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to perform health check"
    });
  }
});

export default router;
