# Deployment Guide

This guide explains how to deploy the Contract Management System with the backend on Render and frontend on Vercel.

## Backend Deployment (Render)

### Prerequisites
1. Create a Render account at [render.com](https://render.com)
2. Set up a PostgreSQL database on Render or use an external provider

### Steps

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Choose the `backend` folder as the root directory
   - Use the following settings:
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python run_production.py`
     - **Plan**: Free (or paid for better performance)

2. **Set Environment Variables**
   Add these environment variables in Render's dashboard:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   SECRET_KEY=your-production-secret-key-change-this
   LLAMACLOUD_API_KEY=your-llamacloud-api-key
   LLAMACLOUD_BASE_URL=https://api.llamaindex.ai
   ENVIRONMENT=production
   PORT=10000
   ```

3. **Database Setup**
   - Create a PostgreSQL database on Render or use an external provider
   - Install the pgvector extension: `CREATE EXTENSION vector;`
   - The app will automatically create tables on first run

### Configuration Files Created
- `backend/render.yaml` - Render service configuration
- `backend/Dockerfile` - Docker configuration for containerized deployment
- `backend/.env.production` - Production environment template

## Frontend Deployment (Vercel)

### Prerequisites
1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`

### Steps

1. **Deploy via Vercel CLI**
   ```bash
   cd /Users/amanshishodia/Desktop/assignmnet2
   vercel
   ```

2. **Or Deploy via Vercel Dashboard**
   - Connect your GitHub repository
   - Vercel will auto-detect it's a Vite project
   - Set the root directory to the project root

3. **Set Environment Variables**
   Add this environment variable in Vercel's dashboard:
   ```
   VITE_API_URL=https://your-render-app-name.onrender.com
   ```

### Configuration Files Created
- `vercel.json` - Vercel deployment configuration
- `.env.production` - Production environment template

## Post-Deployment Steps

1. **Update CORS Settings**
   - After deploying to Vercel, update the backend CORS settings
   - Add your Vercel domain to the allowed origins in `backend/app/main.py`

2. **Test the Deployment**
   - Register a new user
   - Upload a test contract
   - Perform a query to ensure everything works

3. **Monitor Logs**
   - Check Render logs for backend issues
   - Check Vercel function logs for frontend issues

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Vercel domain is added to CORS origins
   - Check that the API URL is correctly set

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure pgvector extension is installed

3. **Environment Variables**
   - Double-check all environment variables are set
   - Ensure no trailing spaces in values

### Health Checks
- Backend health: `https://your-render-app.onrender.com/health`
- API docs: `https://your-render-app.onrender.com/docs`

## Security Notes

1. **Never commit sensitive environment variables**
2. **Use strong, unique SECRET_KEY for production**
3. **Regularly rotate API keys**
4. **Enable HTTPS only in production**
