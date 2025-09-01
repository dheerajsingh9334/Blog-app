#!/bin/bash

# Build script for Vercel deployment
echo "🚀 Starting build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

echo "✅ Build completed successfully!"
