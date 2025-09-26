#!/bin/bash

# MyTrails API Test Script

API_URL="http://localhost:8080"

echo "🧪 Testing MyTrails API..."

# Test if API is running
echo "1. Testing API health..."
if curl -s "$API_URL/trails" > /dev/null; then
    echo "✅ API is running"
else
    echo "❌ API is not responding. Make sure it's running on port 8080"
    exit 1
fi

# Test get all trails
echo "2. Testing GET /trails..."
TRAILS_RESPONSE=$(curl -s "$API_URL/trails")
echo "Response: $TRAILS_RESPONSE"

# Test search with location
echo "3. Testing search with location..."
SEARCH_RESPONSE=$(curl -s "$API_URL/search?near_lat=40.7128&near_lng=-74.0060&near_distance=1000")
echo "Search response: $SEARCH_RESPONSE"

# Test get trail by ID (if trails exist)
TRAIL_ID=$(echo "$TRAILS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ ! -z "$TRAIL_ID" ]; then
    echo "4. Testing GET /route/$TRAIL_ID..."
    TRAIL_RESPONSE=$(curl -s "$API_URL/route/$TRAIL_ID")
    echo "Trail details: $TRAIL_RESPONSE"
else
    echo "⚠️  No trails found to test individual trail endpoint"
fi

echo ""
echo "🎉 API testing completed!"
