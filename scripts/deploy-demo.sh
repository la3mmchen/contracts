#!/bin/bash

# Deploy Contracts App to GitHub Pages Demo
# This script builds and deploys the React app to GitHub Pages

set -e

echo "🚀 Deploying Contracts App to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "client/package.json" ]; then
    echo "❌ Error: Please run this script from the root directory of the project"
    exit 1
fi

# Navigate to client directory
cd client

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building the application..."
GITHUB_PAGES=true npm run build

echo "🚀 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment complete!"
echo "🌐 Your demo should be available at: https://la3mmchen.github.io/contracts"
echo "⏱️  It may take a few minutes for changes to appear."

# Return to root directory
cd ..
