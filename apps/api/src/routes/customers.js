import express from "express";
import Customer from "../models/Customer.js";

const router = express.Router();

// GET all customers or search by email
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (email) {
      // Search by email
      const customer = await Customer.findOne({ email: email.toLowerCase() }).select('-__v');
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: "Customer not found"
        });
      }

      return res.json({
        success: true,
        data: customer
      });
    } else {
      // Get all customers
      const customers = await Customer.find().select('-__v');
      return res.json({
        success: true,
        data: customers,
        count: customers.length
      });
    }
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch customers"
    });
  }
});

// GET customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-__v');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error("Get customer by ID error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid customer ID format"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch customer"
    });
  }
});

export default router;