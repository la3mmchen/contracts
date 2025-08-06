#!/bin/sh

# Generate config.json from environment variables
echo "Generating config.json from environment variables..."

# Default values
API_URL=${API_URL:-"http://localhost:3001/api"}
APP_NAME=${APP_NAME:-"contracts"}
CATEGORIES=${CATEGORIES:-"subscription,insurance,utilities,rent,services,software,maintenance,other"}

echo "API_URL: $API_URL"
echo "APP_NAME: $APP_NAME"
echo "CATEGORIES: $CATEGORIES"

# Create the config file
cat > /usr/share/nginx/html/config.json << EOF
{
  "API_URL": "$API_URL",
  "APP_NAME": "$APP_NAME",
  "CATEGORIES": "$CATEGORIES"
}
EOF

echo "✅ config.json generated!"

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;" 