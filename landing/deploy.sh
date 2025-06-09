#!/bin/bash

# Deployment script for Sweeply Landing Website

echo "🚀 Starting deployment process for Sweeply Landing Website..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build the project
echo "🔨 Building project..."
npm run build

# Step 3: Check if build was successful
if [ ! -d "dist" ]; then
  echo "❌ Build failed! 'dist' directory does not exist."
  exit 1
fi

echo "✅ Build completed successfully!"

# Optional: Deploy to hosting service (uncomment and modify as needed)
# echo "🌐 Deploying to hosting service..."
# If using Vercel
# vercel --prod
# If using Netlify
# netlify deploy --prod
# If using custom hosting
# rsync -avz --delete dist/ user@server:/path/to/webroot/

echo "🎉 Deployment process completed!"
echo "Note: Manual deployment to your hosting service may be required."
echo "The built files are in the 'dist/' directory." 