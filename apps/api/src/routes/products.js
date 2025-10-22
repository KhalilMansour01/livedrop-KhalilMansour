import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// GET all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sort = 'name', 
      page = 1, 
      limit = 20,
      minPrice,
      maxPrice,
      inStock
    } = req.query;

    // Build query
    let query = {};
    
    if (category) {
      query.category = category.toLowerCase();
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'name') sortObj = { name: 1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else sortObj = { name: 1 };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      count: products.length,
      totalCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products"
    });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID format"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch product"
    });
  }
});

// POST create new product (admin endpoint)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, category, tags, imageUrl, stock } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, description, price, and category are required"
      });
    }

    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      category: category.toLowerCase(),
      tags: tags || [],
      imageUrl: imageUrl || "/images/default.jpg",
      stock: stock || 0
    });

    const savedProduct = await newProduct.save();
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct
    });

  } catch (error) {
    console.error("Create product error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validation error: " + error.message
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create product"
    });
  }
});

// GET product categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories"
    });
  }
});

export default router;