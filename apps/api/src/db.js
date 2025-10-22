import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log("❌ MONGODB_URI not found in environment variables");
      console.log("💡 Please create a .env file with your MongoDB connection string");
      console.log("🔄 Starting in mock mode...");
      return false;
    }

    // Ensure the URI includes the database name
    if (!mongoUri.includes('/?') && !mongoUri.includes('/shoplite')) {
      mongoUri = mongoUri.replace('/?', '/shoplite?');
    }
    
    console.log("🔗 Connecting to MongoDB Atlas...");
    console.log("📍 Database: shoplite");
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Shorter timeout for faster feedback
      socketTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    
    console.log("✅ MongoDB Atlas connected successfully!");
    console.log("🎯 Connected to database:", mongoose.connection.name);
    
    // Log connection details
    console.log("📊 Connection details:");
    console.log("   - Host:", mongoose.connection.host);
    console.log("   - Port:", mongoose.connection.port);
    console.log("   - Database:", mongoose.connection.name);
    
    return true;
    
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("💡 Troubleshooting MongoDB Atlas:");
    console.log("   1. Check your internet connection");
    console.log("   2. Verify IP whitelist in MongoDB Atlas (whitelist 0.0.0.0/0 for testing)");
    console.log("   3. Ensure database user credentials are correct");
    console.log("   4. Check if your URI includes the database name");
    console.log("   5. Verify your .env file is in the correct location (apps/api/.env)");
    console.log("🔄 Starting in mock mode...");
    return false;
  }
};