#!/bin/bash

API_BASE="http://localhost:3001/api"
TEST_DATA_DIR="test-data/contracts"

echo "📊 Loading test contract data..."

# Check if API is running
if ! curl -s "$API_BASE/health" > /dev/null; then
    echo "❌ API is not running. Please start the application first:"
    echo "   task run"
    exit 1
fi

# Count total files
total_files=$(find "$TEST_DATA_DIR" -name "*.json" | wc -l)
echo "Found $total_files contracts to load"
echo ""

success_count=0
error_count=0

# Loop through all JSON files in the test-data/contracts directory
for file in "$TEST_DATA_DIR"/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .json)
        echo "📤 Uploading $filename..."
        
        if curl -s -X POST "$API_BASE/contracts" \
            -H "Content-Type: application/json" \
            -d @"$file" > /dev/null; then
            echo "✅ Created: $filename"
            ((success_count++))
        else
            echo "❌ Failed to create: $filename"
            ((error_count++))
        fi
    fi
done

echo ""
echo "📈 Summary:"
echo "✅ Successfully created: $success_count contracts"
echo "❌ Failed to create: $error_count contracts"
echo ""
echo "🌐 Check the application at http://localhost:3000" 