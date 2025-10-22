import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

const router = express.Router();

// Daily revenue analytics with database aggregation
router.get("/daily-revenue", async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: from and to dates (YYYY-MM-DD format)"
      });
    }

    const startDate = new Date(from + "T00:00:00.000Z");
    const endDate = new Date(to + "T23:59:59.999Z");

    // Use MongoDB aggregation to calculate daily revenue
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["PROCESSING", "SHIPPED", "DELIVERED"] } // Only count completed orders
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          revenue: { $round: ["$revenue", 2] },
          orderCount: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    res.json({
      success: true,
      data: dailyRevenue,
      period: { from, to },
      totalDays: dailyRevenue.length
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics data"
    });
  }
});

// Dashboard metrics
router.get("/dashboard-metrics", async (req, res) => {
  try {
    // Get total revenue, orders, and customers using aggregation
    const [revenueStats, orderStats, customerStats, statusBreakdown] = await Promise.all([
      // Total revenue
      Order.aggregate([
        {
          $match: { status: { $in: ["PROCESSING", "SHIPPED", "DELIVERED"] } }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            avgOrderValue: { $avg: "$total" }
          }
        }
      ]),
      
      // Order count
      Order.countDocuments(),
      
      // Customer count
      Customer.countDocuments(),
      
      // Orders by status breakdown
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const avgOrderValue = revenueStats[0]?.avgOrderValue || 0;
    const totalOrders = orderStats;
    const totalCustomers = customerStats;

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentCustomers = await Customer.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalCustomers,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100
        },
        recentActivity: {
          ordersLast7Days: recentOrders,
          customersLast7Days: recentCustomers
        },
        orderStatusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard metrics"
    });
  }
});

// Product analytics
router.get("/product-metrics", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Top selling products using aggregation
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            productId: "$items.productId",
            productName: "$items.name"
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 0,
          productId: "$_id.productId",
          productName: "$_id.productName",
          totalQuantity: 1,
          totalRevenue: { $round: ["$totalRevenue", 2] }
        }
      }
    ]);

    res.json({
      success: true,
      data: topProducts,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error("Product analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch product analytics"
    });
  }
});

export default router;
