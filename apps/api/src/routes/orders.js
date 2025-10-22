import express from "express";
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";

const router = express.Router();

// GET all orders or filter by customerId
router.get("/", async (req, res) => {
  try {
    const { customerId } = req.query;
    
    let query = {};
    if (customerId) {
      query.customerId = customerId;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch orders"
    });
  }
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('items.productId', 'name description imageUrl')
      .select('-__v');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found"
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid order ID format"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch order"
    });
  }
});

// POST create new order
router.post("/", async (req, res) => {
  try {
    const { customerId, items, shippingAddress } = req.body;
    
    // Validate required fields
    if (!customerId || !items || !items.length) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customerId and items are required"
      });
    }

    // Validate customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: "Customer not found"
      });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create new order
    const newOrder = new Order({
      customerId,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: parseFloat(total.toFixed(2)),
      shippingAddress: shippingAddress || customer.address,
      status: "PENDING",
      carrier: "UPS",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('customerId', 'name email')
      .select('-__v');

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder
    });

  } catch (error) {
    console.error("Create order error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error: " + error.message
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create order"
    });
  }
});

export default router;