# Week 5 Deployment Guide

This guide covers deploying the complete ShopLite MVP with backend API, frontend, and intelligent assistant.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- GitHub account
- ngrok account (for LLM endpoint)

## 1. Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Create a new project called "ShopLite"

### Step 2: Create Cluster
1. Choose "M0 Sandbox" (free tier)
2. Select region closest to you
3. Name cluster "shoplite-cluster"
4. Click "Create Cluster"

### Step 3: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 4: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `shoplite-user`
5. Password: Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 5: Get Connection String
1. Go to "Clusters" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `shoplite`

Example: `mongodb+srv://shoplite-user:yourpassword@shoplite-cluster.xxxxx.mongodb.net/shoplite?retryWrites=true&w=majority`

## 2. Backend Deployment (Render.com)

### Step 1: Prepare Backend
1. Ensure your backend is in `/apps/api/`
2. Create `.env` file in `/apps/api/`:
```env
MONGODB_URI=mongodb+srv://shoplite-user:yourpassword@shoplite-cluster.xxxxx.mongodb.net/shoplite?retryWrites=true&w=majority
PORT=4000
NODE_ENV=production
LLM_ENDPOINT=http://your-ngrok-url.ngrok.io/generate
```

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `shoplite-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: `production`
   - `LLM_ENDPOINT`: Your ngrok URL (from Step 4)
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Note your backend URL (e.g., `https://shoplite-api.onrender.com`)

### Step 3: Seed Database
1. Go to your deployed backend URL
2. You should see the health check response
3. The database will be automatically seeded on first connection

## 3. LLM Setup (Google Colab + ngrok)

### Step 1: Set Up Colab Notebook
1. Open your Week 3 Colab notebook
2. Add the new `/generate` endpoint as specified in the assignment
3. Run all cells to start the LLM service

### Step 2: Expose with ngrok
1. Install ngrok: `pip install pyngrok`
2. Get your ngrok auth token from [ngrok.com](https://ngrok.com)
3. In Colab, run:
```python
from pyngrok import ngrok
ngrok.set_auth_token("your-ngrok-token")
public_url = ngrok.connect(5000)
print(f"LLM endpoint: {public_url}/generate")
```

### Step 3: Update Backend
1. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
2. Update your backend's `LLM_ENDPOINT` environment variable
3. Redeploy if necessary

## 4. Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Create `.env.local` file in `/apps/storefront/`:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `apps/storefront`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variable:
   - `VITE_API_URL`: Your backend URL
7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. Note your frontend URL (e.g., `https://shoplite-storefront.vercel.app`)

## 5. Testing the Deployment

### Step 1: Test Backend
1. Visit your backend URL
2. You should see the health check response
3. Test endpoints:
   - `GET /api/products` - Should return products
   - `GET /api/customers?email=demo@example.com` - Should return demo user
   - `GET /api/analytics/dashboard-metrics` - Should return metrics

### Step 2: Test Frontend
1. Visit your frontend URL
2. You should see the storefront
3. Test the complete flow:
   - Browse products
   - Add to cart
   - Sign in with `demo@example.com`
   - Place order
   - Track order with SSE
   - Use support assistant

### Step 3: Test Assistant
1. Open the support panel
2. Ask: "What is your return policy?"
3. Should get response with citation
4. Ask: "What's my order status?"
5. Should get order information

## 6. Admin Dashboard

### Access Admin Dashboard
1. Go to your frontend URL
2. Navigate to `/admin` (e.g., `https://shoplite-storefront.vercel.app/admin`)
3. You should see:
   - Business metrics
   - Performance monitoring
   - Assistant analytics
   - System health

## 7. Environment Variables Summary

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shoplite
PORT=4000
NODE_ENV=production
LLM_ENDPOINT=https://abc123.ngrok.io/generate
```

### Frontend (.env.local)
```env
VITE_API_URL=https://shoplite-api.onrender.com
```

## 8. Troubleshooting

### Common Issues

**Backend not connecting to MongoDB:**
- Check your MongoDB connection string
- Ensure IP whitelist includes 0.0.0.0/0
- Verify database user credentials

**Frontend not loading:**
- Check VITE_API_URL environment variable
- Ensure backend is deployed and accessible
- Check browser console for errors

**Assistant not responding:**
- Verify LLM_ENDPOINT is correct
- Check that Colab notebook is running
- Ensure ngrok tunnel is active

**SSE not working:**
- Check browser console for connection errors
- Verify backend SSE endpoint is accessible
- Test with curl: `curl https://your-backend.com/api/orders/ORDER_ID/stream`

### Health Checks

**Backend Health:**
- `GET https://your-backend.com/` - Should return health status
- `GET https://your-backend.com/api/dashboard/health` - Detailed health check

**Frontend Health:**
- Visit your frontend URL
- Check browser console for errors
- Test API calls in Network tab

## 9. Demo Users

The following demo users are available for testing:
- `demo@example.com` - Main demo user with orders
- `sarah.j@example.com` - Secondary user
- `michael.chen@example.com` - Another test user

## 10. Final Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed to Render and responding
- [ ] LLM service running on Colab with ngrok
- [ ] Frontend deployed to Vercel and loading
- [ ] Database seeded with test data
- [ ] All API endpoints responding
- [ ] SSE connections working
- [ ] Assistant responding to queries
- [ ] Admin dashboard accessible
- [ ] Complete purchase flow working

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test each component individually
4. Check the backend logs in Render dashboard
5. Ensure all services are running and accessible

Your complete MVP should now be live and functional! 🚀
