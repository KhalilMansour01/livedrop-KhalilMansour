import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for search functionality
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);
