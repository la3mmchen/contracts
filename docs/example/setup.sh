#!/bin/bash

# Contracts Application Setup Script
# This script helps you set up the contracts application with Docker Compose

set -e

echo "🚀 Setting up Contracts Application..."

# Check if docker and docker-compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ssl logs

# Create data directory for contracts
echo "📁 Creating data directory..."
sudo mkdir -p /data/contracts
sudo chmod 755 /data/contracts

# Create basic auth file
echo "🔐 Setting up basic authentication..."
if [ ! -f htpasswd ]; then
    echo "Please create a htpasswd file with your credentials:"
    echo "htpasswd -c htpasswd your-username"
    echo ""
    echo "Or if you don't have htpasswd installed:"
    echo "sudo apt-get install apache2-utils  # Ubuntu/Debian"
    echo "sudo yum install httpd-tools        # CentOS/RHEL"
    echo "brew install httpd                  # macOS"
    exit 1
fi

# Check for SSL certificates
echo "🔒 Checking SSL certificates..."
if [ ! -f ssl/fullchain.pem ] || [ ! -f ssl/privkey.pem ]; then
    echo "⚠️  SSL certificates not found in ssl/ directory"
    echo "Please place your SSL certificates:"
    echo "- ssl/fullchain.pem"
    echo "- ssl/privkey.pem"
    echo ""
    echo "You can obtain free certificates from Let's Encrypt:"
    echo "certbot certonly --standalone -d contracts.yourdomain.com"
    exit 1
fi

# Update domain in nginx.conf
echo "🌐 Updating domain configuration..."
read -p "Enter your domain (e.g., contracts.yourdomain.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ Domain is required"
    exit 1
fi

# Update nginx.conf with the domain
sed -i.bak "s/contracts\.yourdomain\.com/$DOMAIN/g" nginx.conf

# Update docker-compose.yaml with the domain
sed -i.bak "s/contracts\.yourdomain\.com/$DOMAIN/g" docker-compose.yaml

echo "✅ Configuration updated with domain: $DOMAIN"

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Your contracts application should now be available at:"
echo "https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Restart services: docker-compose restart"
echo "- Update: docker-compose pull && docker-compose up -d"
echo ""
echo "Health check:"
echo "curl -k https://$DOMAIN/health"
echo ""
echo "API health check:"
echo "curl -k https://$DOMAIN/api/health" 