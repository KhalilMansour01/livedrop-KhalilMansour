// Quick fix script for TypeScript errors
const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/pages/catalog.tsx',
  'src/pages/product.tsx', 
  'src/pages/cart.tsx',
  'src/pages/order-status.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix product properties
    content = content.replace(/product\.id/g, 'product._id');
    content = content.replace(/product\.title/g, 'product.name');
    content = content.replace(/product\.image/g, 'product.imageUrl');
    content = content.replace(/product\.stockQty/g, 'product.stock');
    
    // Fix order properties
    content = content.replace(/order\.id/g, 'order._id');
    content = content.replace(/order\.eta/g, 'order.estimatedDelivery');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});

console.log('All files fixed!');
