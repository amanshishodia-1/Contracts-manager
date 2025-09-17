# Deploy to Vercel Website

This guide shows how to deploy your React frontend to Vercel using the Vercel website dashboard.

## Prerequisites

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Have a Vercel account (sign up at vercel.com)

## Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Select this project folder

### 2. Configure Project Settings
Vercel will auto-detect your project as a Vite application. Verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### 3. Environment Variables
Add the following environment variable in Vercel's dashboard:

```
VITE_API_URL=https://contracts-manager-pxgs.onrender.com
```

To add environment variables:
1. Go to your project settings
2. Click "Environment Variables"
3. Add `VITE_API_URL` with the value above
4. Set it for Production, Preview, and Development

### 4. Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy your project
3. You'll get a live URL once deployment is complete

## Project Configuration

This project is already configured with:
- ✅ Compatible React 18.2.0 (fixes dependency conflicts)
- ✅ Proper routing configuration in `vercel.json`
- ✅ Optimized build settings
- ✅ Environment variable setup

## Troubleshooting

If deployment fails:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify the environment variable is set correctly
4. Make sure your repository is up to date

## Auto-Deployments

Once connected, Vercel will automatically deploy:
- **Production**: When you push to your main/master branch
- **Preview**: When you create pull requests or push to other branches
