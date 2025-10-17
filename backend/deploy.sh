#!/bin/bash
# Simple deployment script for the FastAPI backend

echo "🚀 Deploying Fate Shift Astrology API..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t fate-shift-api .

# Run container
echo "🏃 Starting container..."
docker run -d \
  --name fate-shift-api \
  -p 8080:8080 \
  -e PORT=8080 \
  -e EPHE_PATH=ephemeris \
  fate-shift-api

echo "✅ Deployment complete!"
echo "🌐 API running at http://localhost:8080"
echo "🏥 Health check: http://localhost:8080/health"
