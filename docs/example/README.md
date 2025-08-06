# Production Deployment Guide

This directory contains ready-to-use configuration files for deploying the contracts application in production.

## Files Overview

- **`docker-compose.yaml`** - Complete Docker Compose configuration with nginx proxy
- **`nginx.conf`** - Nginx configuration with SSL, basic auth, and proper routing
- **`setup.sh`** - Automated setup script to get you started quickly

## Quick Start

1. **Clone or copy these files** to your server
2. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## Manual Setup

If you prefer to set up manually:

### 1. Prerequisites

- Docker and Docker Compose installed
- SSL certificates for your domain
- Basic authentication credentials

### 2. SSL Certificates

Place your SSL certificates in the `ssl/` directory:
```
ssl/
├── fullchain.pem
└── privkey.pem
```

### 3. Basic Authentication

Create a `.htpasswd` file:
```bash
htpasswd -c htpasswd your-username
```

### 4. Update Configuration

Edit the files to replace `contracts.yourdomain.com` with your actual domain:
- `docker-compose.yaml`
- `nginx.conf`

### 5. Create Data Directory

```bash
sudo mkdir -p /data/contracts
sudo chmod 755 /data/contracts
```

### 6. Deploy

```bash
docker-compose up -d
```

## Configuration Details

### Docker Compose Services

- **`frontend`** - React application with runtime configuration
- **`backend`** - Node.js API for contract management
- **`nginx`** - Reverse proxy with SSL termination and basic auth

### Nginx Features

- ✅ **SSL/TLS encryption** with modern cipher suites
- ✅ **HTTP/2 support** for better performance
- ✅ **Basic authentication** for security
- ✅ **Proper routing** - `/api` to backend, `/` to frontend
- ✅ **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ **Gzip compression** for better performance
- ✅ **Health check endpoint** at `/health`

### Environment Variables

**Frontend (`frontend` service):**
- `API_URL` - Full HTTPS URL to your API (e.g., `https://contracts.yourdomain.com/api`)
- `APP_NAME` - Application name displayed in header
- `CONTRACTS_CATEGORIES` - Comma-separated list of contract categories

**Backend (`backend` service):**
- `PORT` - API server port (3001)
- `CONTRACTS_DATA_DIR` - Directory for storing contract files

## Monitoring

### Health Checks

```bash
# Nginx health
curl https://yourdomain.com/health

# API health
curl https://yourdomain.com/api/health

# Container status
docker-compose ps
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f nginx
```

### Data Backup

```bash
# Backup contracts
cp -r /data/contracts /backup/contracts-$(date +%Y%m%d)

# Restore contracts
cp -r /backup/contracts-20241201/* /data/contracts/
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Ensure certificates are in `ssl/` directory
   - Check certificate validity: `openssl x509 -in ssl/fullchain.pem -text -noout`

2. **Authentication Issues**
   - Verify `.htpasswd` file exists and has correct permissions
   - Test with: `htpasswd -v .htpasswd your-username`

3. **API Connection Issues**
   - Check if `API_URL` in docker-compose.yaml uses HTTPS
   - Verify domain matches SSL certificate
   - Check nginx logs: `docker-compose logs nginx`

4. **Data Persistence Issues**
   - Ensure `/data/contracts` directory exists and has correct permissions
   - Check volume mount in docker-compose.yaml

### Useful Commands

```bash
# Restart specific service
docker-compose restart frontend

# Update images and restart
docker-compose pull && docker-compose up -d

# View container resource usage
docker stats

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Security Considerations

- ✅ **SSL/TLS encryption** enabled
- ✅ **Basic authentication** required
- ✅ **Security headers** configured
- ✅ **Data persistence** with proper permissions
- ⚠️ **Consider additional security measures**:
  - Firewall rules
  - Rate limiting
  - IP whitelisting
  - Regular security updates 