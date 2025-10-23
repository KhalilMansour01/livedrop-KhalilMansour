import mongoose from "mongoose";
import dotenv from "dotenv";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { connectDB } from "../db.js";

dotenv.config();

const customers = [
  {
    name: "Demo User",
    email: "demo@example.com",
    phone: "+1-555-0101",
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "US"
    }
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1-555-0102",
    address: {
      street: "456 Oak Avenue",
      city: "New York",
      state: "NY", 
      zipCode: "10001",
      country: "US"
    }
  },
  {
    name: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "+1-555-0103",
    address: {
      street: "789 Pine Street",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "US"
    }
  },
  {
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    phone: "+1-555-0104",
    address: {
      street: "321 Elm Drive",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "US"
    }
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1-555-0105",
    address: {
      street: "654 Maple Lane",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "US"
    }
  },
  {
    name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    phone: "+1-555-0106",
    address: {
      street: "987 Cedar Road",
      city: "Boston",
      state: "MA",
      zipCode: "02101",
      country: "US"
    }
  },
  {
    name: "James Wilson",
    email: "james.w@example.com",
    phone: "+1-555-0107",
    address: {
      street: "147 Birch Street",
      city: "Austin",
      state: "TX",
      zipCode: "73301",
      country: "US"
    }
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "+1-555-0108",
    address: {
      street: "258 Spruce Avenue",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "US"
    }
  },
  {
    name: "Robert Brown",
    email: "robert.brown@example.com",
    phone: "+1-555-0109",
    address: {
      street: "369 Willow Way",
      city: "Denver",
      state: "CO",
      zipCode: "80201",
      country: "US"
    }
  },
  {
    name: "Jennifer Davis",
    email: "jennifer.davis@example.com",
    phone: "+1-555-0110",
    address: {
      street: "741 Ash Boulevard",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "US"
    }
  },
  {
    name: "Christopher Lee",
    email: "chris.lee@example.com",
    phone: "+1-555-0111",
    address: {
      street: "852 Poplar Place",
      city: "Nashville",
      state: "TN",
      zipCode: "37201",
      country: "US"
    }
  },
  {
    name: "Amanda White",
    email: "amanda.white@example.com",
    phone: "+1-555-0112",
    address: {
      street: "963 Sycamore Street",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
      country: "US"
    }
  }
];

const products = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling headphones with 30-hour battery life",
    price: 199.99,
    category: "electronics",
    tags: ["audio", "wireless", "bluetooth", "noise-cancelling"],
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    stock: 25
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Soft, sustainable organic cotton t-shirt in multiple colors",
    price: 29.99,
    category: "clothing",
    tags: ["clothing", "organic", "cotton", "sustainable"],
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", 
    stock: 100
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "1L insulated stainless steel bottle, keeps drinks cold for 24 hours",
    price: 34.99,
    category: "kitchen",
    tags: ["hydration", "eco-friendly", "insulated"],
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop",
    stock: 50
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracker with heart rate monitoring and GPS",
    price: 299.99,
    category: "electronics",
    tags: ["fitness", "smartwatch", "health", "gps"],
    imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400&h=300&fit=crop",
    stock: 30
  },
  {
    name: "Denim Jeans",
    description: "Classic fit denim jeans made from sustainable materials",
    price: 89.99,
    category: "clothing",
    tags: ["denim", "jeans", "casual", "sustainable"],
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop",
    stock: 75
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted ceramic mug perfect for your morning coffee",
    price: 19.99,
    category: "kitchen",
    tags: ["ceramic", "coffee", "mug", "handcrafted"],
    imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop",
    stock: 60
  },
  {
    name: "Wireless Charging Pad",
    description: "Fast wireless charging pad compatible with all Qi devices",
    price: 49.99,
    category: "electronics",
    tags: ["wireless", "charging", "qi", "fast-charge"],
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
    stock: 40
  },
  {
    name: "Hooded Sweatshirt",
    description: "Comfortable fleece hoodie perfect for casual wear",
    price: 59.99,
    category: "clothing",
    tags: ["hoodie", "fleece", "casual", "warm"],
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop",
    stock: 45
  },
  {
    name: "Bamboo Cutting Board",
    description: "Eco-friendly bamboo cutting board with antimicrobial properties",
    price: 39.99,
    category: "kitchen",
    tags: ["bamboo", "cutting-board", "eco-friendly", "antimicrobial"],
    imageUrl: "https://images.unsplash.com/photo-1556909114-4d0d853e5e25?w=400&h=300&fit=crop",
    stock: 35
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof speaker with 12-hour battery life",
    price: 79.99,
    category: "electronics",
    tags: ["speaker", "bluetooth", "portable", "waterproof"],
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
    stock: 55
  },
  {
    name: "Leather Wallet",
    description: "Genuine leather wallet with RFID blocking technology",
    price: 69.99,
    category: "accessories",
    tags: ["leather", "wallet", "rfid-blocking", "genuine"],
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop",
    stock: 80
  },
  {
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap included",
    price: 44.99,
    category: "sports",
    tags: ["yoga", "mat", "non-slip", "fitness"],
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    stock: 65
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with USB charging port",
    price: 89.99,
    category: "electronics",
    tags: ["led", "lamp", "desk", "usb-charging"],
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop",
    stock: 25
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with breathable mesh upper",
    price: 129.99,
    category: "sports",
    tags: ["running", "shoes", "lightweight", "breathable"],
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
    stock: 50
  },
  {
    name: "Glass Food Container Set",
    description: "Set of 5 glass food containers with leak-proof lids",
    price: 54.99,
    category: "kitchen",
    tags: ["glass", "containers", "food-storage", "leak-proof"],
    imageUrl: "https://images.unsplash.com/photo-1556909114-4d0d853e5e25?w=400&h=300&fit=crop",
    stock: 40
  },
  {
    name: "Phone Case",
    description: "Protective phone case with built-in card holder",
    price: 24.99,
    category: "accessories",
    tags: ["phone-case", "protective", "card-holder"],
    imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop",
    stock: 120
  },
  {
    name: "Essential Oil Diffuser",
    description: "Ultrasonic essential oil diffuser with LED mood lighting",
    price: 39.99,
    category: "home",
    tags: ["diffuser", "essential-oils", "ultrasonic", "led"],
    imageUrl: "https://images.unsplash.com/photo-1603712610490-4c428fcd6f71?w=400&h=300&fit=crop",
    stock: 30
  },
  {
    name: "Canvas Tote Bag",
    description: "Eco-friendly canvas tote bag perfect for shopping",
    price: 19.99,
    category: "accessories",
    tags: ["canvas", "tote-bag", "eco-friendly", "shopping"],
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    stock: 90
  },
  {
    name: "Digital Kitchen Scale",
    description: "Precision digital kitchen scale with LCD display",
    price: 29.99,
    category: "kitchen",
    tags: ["scale", "digital", "kitchen", "precision"],
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d69c3d059d?w=400&h=300&fit=crop",
    stock: 35
  },
  {
    name: "Resistance Bands Set",
    description: "Set of 5 resistance bands for home workouts",
    price: 34.99,
    category: "sports",
    tags: ["resistance-bands", "workout", "fitness", "home-gym"],
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    stock: 60
  },
  {
    name: "Bluetooth Earbuds",
    description: "True wireless earbuds with active noise cancellation",
    price: 149.99,
    category: "electronics",
    tags: ["earbuds", "wireless", "noise-cancellation", "bluetooth"],
    imageUrl: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e0?w=400&h=300&fit=crop",
    stock: 45
  },
  {
    name: "Wool Scarf",
    description: "Soft merino wool scarf perfect for cold weather",
    price: 49.99,
    category: "clothing",
    tags: ["scarf", "wool", "merino", "warm"],
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    stock: 55
  },
  {
    name: "Aromatherapy Candles Set",
    description: "Set of 3 soy wax candles in relaxing scents",
    price: 39.99,
    category: "home",
    tags: ["candles", "soy-wax", "aromatherapy", "relaxing"],
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    stock: 40
  },
  {
    name: "Laptop Stand",
    description: "Adjustable aluminum laptop stand for ergonomic working",
    price: 79.99,
    category: "accessories",
    tags: ["laptop-stand", "adjustable", "aluminum", "ergonomic"],
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
    stock: 25
  },
  {
    name: "Protein Shaker Bottle",
    description: "BPA-free protein shaker bottle with mixing ball",
    price: 14.99,
    category: "sports",
    tags: ["shaker-bottle", "protein", "bpa-free", "mixing-ball"],
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d69c3d059d?w=400&h=300&fit=crop",
    stock: 85
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with precision tracking",
    price: 39.99,
    category: "electronics",
    tags: ["mouse", "wireless", "ergonomic", "precision"],
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    stock: 70
  },
  {
    name: "Cotton Bed Sheets Set",
    description: "100% cotton bed sheets set in multiple colors",
    price: 69.99,
    category: "home",
    tags: ["bed-sheets", "cotton", "bedroom", "soft"],
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    stock: 50
  },
  {
    name: "Travel Backpack",
    description: "Durable travel backpack with laptop compartment",
    price: 89.99,
    category: "accessories",
    tags: ["backpack", "travel", "laptop-compartment", "durable"],
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    stock: 35
  },
  {
    name: "Insulated Travel Mug",
    description: "Double-wall insulated travel mug keeps drinks hot/cold",
    price: 24.99,
    category: "kitchen",
    tags: ["travel-mug", "insulated", "double-wall", "hot-cold"],
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=300&fit=crop",
    stock: 60
  }
];
async function generateOrders(customers, products) {
  const orders = [];
  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const carriers = ["UPS", "FedEx", "USPS", "DHL"];
  
  // Generate 20 orders
  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
    
    const orderItems = [];
    let total = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
      
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });
      
      total += product.price * quantity;
    }
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const carrier = carriers[Math.floor(Math.random() * carriers.length)];
    
    // Calculate estimated delivery based on status
    let estimatedDelivery;
    if (status === "DELIVERED") {
      estimatedDelivery = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000); // Past delivery
    } else {
      const daysFromNow = Math.floor(Math.random() * 10) + 1;
      estimatedDelivery = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    }
    
    orders.push({
      customerId: customer._id,
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      status: status,
      shippingAddress: customer.address,
      carrier: carrier,
      estimatedDelivery: estimatedDelivery,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date within last 30 days
    });
  }
  
  return orders;
}

async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing data
    await Customer.deleteMany({});
    await Product.deleteMany({}); 
    await Order.deleteMany({});
    
    console.log("🗑️  Cleared existing data");
    
    // Insert customers
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`✅ Added ${createdCustomers.length} customers`);
    
    // Insert products  
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Added ${createdProducts.length} products`);
    
    // Generate and insert orders
    const orders = await generateOrders(createdCustomers, createdProducts);
    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Added ${createdOrders.length} orders`);
    
    console.log("🎉 Database seeded successfully!");
    console.log("📧 Demo user: demo@example.com");
    
    // Show some statistics
    const demoUser = createdCustomers.find(c => c.email === "demo@example.com");
    const demoUserOrders = createdOrders.filter(o => o.customerId.toString() === demoUser._id.toString());
    
    console.log("📊 Database Statistics:");
    console.log(`   - Customers: ${createdCustomers.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Demo user orders: ${demoUserOrders.length}`);
    
    if (demoUserOrders.length > 0) {
      console.log("📦 Demo user order IDs:");
      demoUserOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order._id} (${order.status}) - $${order.total}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();