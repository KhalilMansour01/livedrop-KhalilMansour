import express from "express";
import Order from "../models/Order.js";

const router = express.Router();

// Store active SSE connections
const activeConnections = new Map();

// SSE endpoint for real-time order status updates
router.get("/:id/stream", async (req, res) => {
  const orderId = req.params.id;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  try {
    // Find the order
    const order = await Order.findById(orderId).populate('customerId');
    
    if (!order) {
      res.write(`data: ${JSON.stringify({ error: "Order not found" })}\n\n`);
      res.end();
      return;
    }

    // Send initial status
    const initialStatus = {
      orderId: order._id,
      status: order.status,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
      timestamp: new Date().toISOString(),
      message: `Order ${order.status.toLowerCase()}`
    };

    res.write(`data: ${JSON.stringify(initialStatus)}\n\n`);

    // Store connection for cleanup
    activeConnections.set(orderId, res);

    // Auto-simulate status progression if not already delivered
    if (order.status !== 'DELIVERED') {
      simulateOrderProgression(orderId, res);
    } else {
      // If already delivered, close connection after a short delay
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ 
          type: 'complete', 
          message: 'Order tracking complete',
          timestamp: new Date().toISOString()
        })}\n\n`);
        res.end();
        activeConnections.delete(orderId);
      }, 1000);
    }

    // Handle client disconnect
    req.on('close', () => {
      activeConnections.delete(orderId);
    });

    req.on('error', () => {
      activeConnections.delete(orderId);
    });

  } catch (error) {
    console.error('SSE Error:', error);
    res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
    res.end();
  }
});

// Simulate order status progression
async function simulateOrderProgression(orderId, res) {
  const statusFlow = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const delays = [3000, 5000, 7000]; // 3s, 5s, 7s delays between statuses
  
  try {
    let order = await Order.findById(orderId);
    if (!order) return;

    let currentIndex = statusFlow.indexOf(order.status);
    
    // If order is already at a later status, start from there
    if (currentIndex === -1) {
      currentIndex = 0;
      order.status = statusFlow[0];
      await order.save();
    }

    // Progress through remaining statuses
    for (let i = currentIndex; i < statusFlow.length - 1; i++) {
      const delay = delays[i] || 5000;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Check if connection is still active
      if (!activeConnections.has(orderId)) {
        return;
      }

      // Update status
      const nextStatus = statusFlow[i + 1];
      order = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: nextStatus,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!order) return;

      // Send SSE event
      const statusUpdate = {
        orderId: order._id,
        status: order.status,
        carrier: order.carrier,
        estimatedDelivery: order.estimatedDelivery,
        timestamp: new Date().toISOString(),
        message: getStatusMessage(order.status),
        previousStatus: statusFlow[i]
      };

      res.write(`data: ${JSON.stringify(statusUpdate)}\n\n`);

      // If delivered, close connection
      if (nextStatus === 'DELIVERED') {
        setTimeout(() => {
          res.write(`data: ${JSON.stringify({ 
            type: 'complete', 
            message: 'Order tracking complete - delivered!',
            timestamp: new Date().toISOString()
          })}\n\n`);
          res.end();
          activeConnections.delete(orderId);
        }, 2000);
        break;
      }
    }
  } catch (error) {
    console.error('Status progression error:', error);
    res.write(`data: ${JSON.stringify({ error: "Status update failed" })}\n\n`);
    res.end();
    activeConnections.delete(orderId);
  }
}

// Helper function to get status messages
function getStatusMessage(status) {
  const messages = {
    'PENDING': 'Order received and being processed',
    'PROCESSING': 'Order is being prepared for shipment',
    'SHIPPED': 'Order has been shipped and is on its way',
    'DELIVERED': 'Order has been delivered successfully'
  };
  return messages[status] || `Order status: ${status.toLowerCase()}`;
}

// Get active connections count (for dashboard metrics)
export function getActiveConnectionsCount() {
  return activeConnections.size;
}

// Close all connections (for cleanup)
export function closeAllConnections() {
  activeConnections.forEach((res, orderId) => {
    res.end();
  });
  activeConnections.clear();
}

export default router;
