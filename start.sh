#!/bin/bash

# MyTrails Startup Script

echo "🚀 Starting MyTrails GPX Trail Explorer..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if GPX files exist
if [ ! -d "gpx" ] || [ -z "$(ls -A gpx/*.gpx 2>/dev/null)" ]; then
    echo "⚠️  No GPX files found in ./gpx directory."
    echo "   Please add some .gpx files to the gpx/ directory for testing."
    echo "   A sample file has been created for you."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "🌐 Web Interface: http://localhost:3000"
echo "🔌 API Endpoint: http://localhost:8080"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
echo "🎯 API Endpoints:"
echo "   - GET /trails - Get all trails"
echo "   - GET /search?near_lat=40.7128&near_lng=-74.0060&near_distance=1000 - Search trails"
echo "   - GET /route/{id} - Get trail details"
