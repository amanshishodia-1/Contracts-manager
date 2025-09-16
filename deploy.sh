#!/bin/bash

# Deployment script for Contract Management System
# Backend: Render, Frontend: Vercel

echo "🚀 Contract Management System Deployment Script"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if required tools are installed
command -v vercel >/dev/null 2>&1 || { 
    echo "❌ Vercel CLI is required but not installed."
    echo "Install it with: npm i -g vercel"
    exit 1
}

echo "✅ Prerequisites check passed"

# Frontend deployment to Vercel
echo ""
echo "📦 Deploying Frontend to Vercel..."
echo "=================================="

# Build the frontend
echo "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed to Vercel successfully"
else
    echo "❌ Vercel deployment failed"
    exit 1
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render manually using the render.yaml configuration"
echo "2. Set up PostgreSQL database on Render"
echo "3. Configure environment variables on both platforms"
echo "4. Update VITE_API_URL with your Render backend URL"
echo ""
echo "📖 See README-DEPLOYMENT.md for detailed instructions"
