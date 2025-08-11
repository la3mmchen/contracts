# contracts

Organize contracts, maintain visibility, and track your spendings.


## ✨ Features

- 📝 **Contract Management** - Create, edit, delete with rich details
- 💰 **Multi-Currency** - Support for 10 major currencies
- 📊 **Analytics Dashboard** - Visual spending & category breakdowns
- 🔍 **Smart Search & Filters** - Find contracts instantly
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 📤 **Export to Markdown** - Bulk export (ZIP) or individual files with filtering
- 🚫 **Data Loss Prevention** - Unsaved changes protection
- ⚡ **Real-time Stats** - Live spending & payment tracking

![contracts](./docs/images/sneak-peek.png)

**⚠️ Data Storage Warning: Contracts are stored as individual JSON files on disk. While this works for personal use, consider backing up your data regularly to prevent potential data loss.**       

## Usage

The project consists of 2 parts: a frontend app and an API that stores your data locally. You can use these container images:

* ghcr.io/la3mmchen/contracts-app:latest
* ghcr.io/la3mmchen/contracts-api:latest

### Example 

You can use `docker-compose.yml` file:

```yaml
name: apps
services:
  frontend:
    image: ghcr.io/la3mmchen/contracts-app:latest
    environment:
      API_URL: "https://contracts.yourdomain.com/api"
      APP_NAME: "contracts"
      CONTRACTS_CATEGORIES: "subscription,insurance,utilities,rent,services,software,maintenance,other"
    restart: unless-stopped

  backend:
    image: ghcr.io/la3mmchen/contracts-api:latest
    environment:
      PORT: 3001
      CONTRACTS_DATA_DIR: "/data"
    volumes:
      - "/data/contracts:/data"
    restart: unless-stopped
```

We don't bring any authentication in the app or api yet, so help yourself with basic auth if you want to use this over the internet.

A comprehensive example is [here](.docs/example).

### Use locally

Instaed of running this on a server you can also just use it locally.

```bash
# Build and run the full application
task run

# Load test data (optional)
task load-test-data

# Check application health
task health
```

Keep in mind: data is stored **Local**: `./data/contracts/` (relative to the path in which you clone the repo)

#### 🔧 Available Commands

When running locally, you can levevarge [Taskfile](https://taskfile.dev/) to execute most of the necessary commands.

```bash
# Docker workflows
task build          # Build Docker images
task run           # Start application
task stop          # Stop containers
task clean         # Clean up everything

# Data management
task load-test-data    # Load sample contracts
task clear-test-data   # Remove test contracts only
task data-info         # Storage information

# Export functionality
task test-export-markdown  # Test Markdown export feature (ZIP and individual files)

# Monitoring
task logs          # View all logs
task health        # Service health status
```
**Configuration Changes:**
To change configuration (app name, API URL, categories), simply update the environment variables in `docker-compose.yml` and restart the app container:

```bash
docker compose restart app
```

## 🚀 CI/CD

### GitHub Actions
- **Docker Build & Push**: Automatically builds and pushes Docker images to GitHub Container Registry

### Docker Images
Images are available at:
- **App**: `ghcr.io/la3mmchen/contracts-app`
- **API**: `ghcr.io/la3mmchen/contracts-api`

**Usage:**
```bash
# Pull and run from registry
docker pull ghcr.io/la3mmchen/contracts-app:latest
docker pull ghcr.io/la3mmchen/contracts-api:latest

# Run with custom configuration
docker run -e APP_NAME="My Contracts" -e API_URL="http://api:3001/api" ghcr.io/la3mmchen/contracts-app:latest
```

## 🌐 Access Points

### Development
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001

### Production
- **Frontend**: https://contracts.yourdomain.com
- **API**: https://contracts.yourdomain.com/api
- **Health Check**: https://contracts.yourdomain.com/api/health

📡 **For complete API documentation, see [API Documentation](docs/api.md)**

The API provides endpoints for:
- **Core Operations**: CRUD operations for contracts
- **Search & Filtering**: Find contracts by various criteria
- **Export & Backup**: Markdown export with filtering options
- **System Information**: Data storage and statistics

## Export 

📤 **See [Export Documentation](docs/export.md) for detailed export functionality**

## 🔧 Environment Variables

### Frontend (Client)
| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `contracts` | Application title displayed in header |
| `CATEGORIES` | `subscription,insurance,utilities,rent,services,software,maintenance,other` | Comma-separated list of contract categories |
| `API_URL` | `http://localhost:3001/api` | Backend API endpoint |

### Backend (API)
| Variable | Default | Description |
|----------|---------|-------------|
| `CONTRACTS_DATA_DIR` | `/app/data` | Directory for storing contract JSON files |
| `PORT` | `3001` | API server port |

**Example custom configuration:**
```yaml
# docker-compose.yml
environment:
  - APP_NAME=My Contract App
  - CATEGORIES=subscription,insurance,utilities,rent,services,marketing,legal
  - API_URL=https://contracts.yourdomain.com/api
  - CONTRACTS_DATA_DIR=/app/data
```

**Runtime Configuration:**
The frontend uses runtime configuration loaded from environment variables. Configuration is generated automatically when the container starts, so no rebuilds are needed for configuration changes.

### Production Configuration Tips

**1. API URL Configuration:**
- Use `https://` for production (not `http://`)
- Include the full domain: `https://contracts.yourdomain.com/api`
- Ensure the domain matches your SSL certificate

**2. Data Persistence:**
- Mount `/data/contracts:/data` to persist contract data
- Ensure proper permissions: `chmod 755 /data/contracts`

**3. Security:**
- Use basic authentication with nginx
- Enable SSL/TLS encryption
- Consider using environment-specific `.env` files

**4. Monitoring:**
- Check container logs: `docker compose logs -f contracts_app`
- Monitor API health: `curl https://contracts.yourdomain.com/api/health`
- Verify data persistence: `ls -la /data/contracts/`

## 🏗️ Project Structure

```
contracts/
├── client/          # Frontend React application
├── api/            # Backend Express API
├── test-data/      # Sample contract data
├── docs/           # Documentation
├── docker-compose.yml
└── Taskfile.yml    # Development workflows
```

### 📚 Documentation
- **README.md** - Project overview and quick start
- **[API Documentation](docs/api.md)** - Complete API reference and examples
- **[Export Documentation](docs/export.md)** - Detailed export functionality guide
- **[Example Configuration](docs/example/)** - Docker and nginx setup examples
