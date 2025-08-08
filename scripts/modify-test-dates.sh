#!/bin/bash

# Script to modify test contract dates for visual testing
# This sets old modification times to test the color coding system

DATA_DIR="./data/contracts"

echo "🎨 Modifying contract dates for visual testing..."

# Check if data directory exists
if [ ! -d "$DATA_DIR" ]; then
    echo "❌ Data directory not found: $DATA_DIR"
    echo "Please run 'task load-test-data' first to create the contracts"
    exit 1
fi

# Function to set a contract's updatedAt to a specific date
set_contract_date() {
    local contract_id=$1
    local new_date=$2
    local file_path="$DATA_DIR/$contract_id.json"
    
    if [ -f "$file_path" ]; then
        # Use jq to update the updatedAt field
        jq --arg date "$new_date" '.updatedAt = $date' "$file_path" > "$file_path.tmp" && mv "$file_path.tmp" "$file_path"
        echo "✅ Updated $contract_id to $new_date"
    else
        echo "❌ Contract file not found: $file_path"
    fi
}

# Find Netflix contract (6 months ago - red highlighting)
netflix_id=$(find "$DATA_DIR" -name "*.json" -exec grep -l "Netflix Premium Subscription" {} \; | head -1 | xargs basename -s .json)
if [ ! -z "$netflix_id" ]; then
    set_contract_date "$netflix_id" "2025-02-08T10:00:00.000Z"
else
    echo "⚠️  Netflix contract not found"
fi

# Find Spotify contract (3 months ago - yellow highlighting)
spotify_id=$(find "$DATA_DIR" -name "*.json" -exec grep -l "Spotify Premium Family" {} \; | head -1 | xargs basename -s .json)
if [ ! -z "$spotify_id" ]; then
    set_contract_date "$spotify_id" "2025-05-08T10:00:00.000Z"
else
    echo "⚠️  Spotify contract not found"
fi

echo ""
echo "🎯 Summary:"
echo "   - Netflix contract set to 6 months ago (should show red highlighting)"
echo "   - Spotify contract set to 3 months ago (should show yellow highlighting)"
echo ""
echo "🔄 Restart the app to see the changes:"
echo "   docker compose restart app"
echo ""
echo "🌐 Check the application at http://localhost:3000"
