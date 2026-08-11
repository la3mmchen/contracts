# API Documentation

The contracts application provides a comprehensive REST API for managing contracts, searching, filtering, and exporting data.

## 📡 API Endpoints

### Authentication
- `GET /api/auth/status` - Report whether auth is enabled and if the caller is authenticated (public)
- `POST /api/auth/login` - Exchange the shared password (`{ "password": "..." }`) for a session cookie (public)
- `POST /api/auth/logout` - Clear the session cookie (public)

When `APP_PASSWORD` is set on the API, all endpoints below (except `/api/health` and `/api/auth/*`) require authentication and return `401 Unauthorized` otherwise. Browsers use the session cookie from `/api/auth/login`; machine clients can instead send an `API_TOKEN` via `Authorization: Bearer <token>` or `X-API-Key: <token>`. When `APP_PASSWORD` is unset, authentication is disabled and all endpoints are open. See the [Security](#-security) section for details.

### Core Contract Operations
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get contract by ID
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### Search & Filtering
- `GET /api/contracts?search=query` - Search contracts
- `GET /api/contracts?status=active` - Filter by status

### Export & Backup
- `GET /api/contracts/export/markdown` - Export all contracts to Markdown (ZIP with individual files)
- `GET /api/contracts/export/markdown/individual` - Export contracts as individual markdown files (JSON response)
- `GET /api/contracts/export/json` - Export contracts as JSON backup with metadata
- `GET /api/contracts/export/markdown?status=active` - Export filtered contracts to Markdown
- `GET /api/contracts/export/markdown?search=query` - Export search results to Markdown

📤 **See [Export Documentation](export.md) for detailed usage examples and best practices**

### **JSON Backup Format**

The JSON export endpoint (`/api/contracts/export/json`) creates a comprehensive backup file with the following structure:

```json
{
  "metadata": {
    "exportType": "json-backup",
    "exportDate": "2024-01-15T10:30:00.000Z",
    "totalContracts": 25,
    "filters": {
      "search": null,
      "status": null,
      "category": null,
      "frequency": null
    },
    "version": "1.0.0",
    "description": "Contracts backup for restoration purposes"
  },
  "contracts": [
    {
      "id": "contract-123",
      "contractId": "NETFLIX-001",
      "name": "Netflix Premium",
      "company": "Netflix Inc.",
      "status": "active",
      "category": "subscription",
      "amount": 15.99,
      "currency": "USD",
      "frequency": "monthly",
      "startDate": "2024-01-01",
      // ... full contract data
    }
    // ... more contracts
  ]
}
```

### **Backup & Restoration**

**Creating Backups:**
```bash
# Full system backup
curl -o full-backup-$(date +%Y%m%d).json http://localhost:3001/api/contracts/export/json

# Active contracts only
curl -o active-backup-$(date +%Y%m%d).json "http://localhost:3001/api/contracts/export/json?status=active"

# Category-specific backup
curl -o utilities-backup-$(date +%Y%m%d).json "http://localhost:3001/api/contracts/export/json?category=utilities"
```

**Restoring from Backup:**
```bash
# Upload backup file to restore contracts
curl -X POST http://localhost:3001/api/contracts/import \
  -H "Content-Type: application/json" \
  -d @full-backup-20240115.json
```

**Note:** The import endpoint for restoration is planned for future implementation.

### System Information
- `GET /api/contracts/info/data` - Data storage information
- `GET /api/contracts/info/stats` - File statistics

## 🔧 Example API Usage

### **Basic Contract Operations**

```bash
# Get all contracts
curl http://localhost:3001/api/contracts

# Get a specific contract
curl http://localhost:3001/api/contracts/contract-id-123

# Create a new contract
curl -X POST http://localhost:3001/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix Subscription",
    "company": "Netflix Inc.",
    "contractId": "NETFLIX-001",
    "status": "active",
    "category": "subscription",
    "amount": 15.99,
    "currency": "USD",
    "frequency": "monthly",
    "startDate": "2024-01-01"
  }'

# Update a contract
curl -X PUT http://localhost:3001/api/contracts/contract-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 19.99
  }'

# Delete a contract
curl -X DELETE http://localhost:3001/api/contracts/contract-id-123
```

### **Search and Filtering**

```bash
# Search contracts by query
curl "http://localhost:3001/api/contracts?search=netflix"

# Filter by status
curl "http://localhost:3001/api/contracts?status=active"
curl "http://localhost:3001/api/contracts?status=expired"

# Combine search and status
curl "http://localhost:3001/api/contracts?search=software&status=active"
```

### **Export Operations**

```bash
# Export all contracts to Markdown file (ZIP archive)
curl -o contracts-backup.zip http://localhost:3001/api/contracts/export/markdown

# Export contracts as individual markdown files (JSON response)
curl -s "http://localhost:3001/api/contracts/export/markdown/individual" | jq .

# Export all contracts as JSON backup
curl -o contracts-backup.json http://localhost:3001/api/contracts/export/json

# Export only active contracts as JSON backup
curl -o active-contracts-backup.json \
  "http://localhost:3001/api/contracts/export/json?status=active"

# Export contracts by category as JSON backup
curl -o subscription-contracts-backup.json \
  "http://localhost:3001/api/contracts/export/json?category=subscription"

# Export contracts by frequency as JSON backup
curl -o monthly-contracts-backup.json \
  "http://localhost:3001/api/contracts/export/json?frequency=monthly"

# Export only active contracts to Markdown file
curl -o active-contracts.zip \
  "http://localhost:3001/api/contracts/export/markdown?status=active"

# Search and export matching contracts
curl -o search-results.zip \
  "http://localhost:3001/api/contracts/export/markdown?search=netflix"
```

### **System Information**

```bash
# Get data storage information
curl http://localhost:3001/api/contracts/info/data

# Get file statistics
curl http://localhost:3001/api/contracts/info/stats
```

## 📊 Response Formats

### **Contract Object Structure**

```json
{
  "id": "unique-contract-id",
  "name": "Contract Name",
  "company": "Company Name",
  "contractId": "CONTRACT-001",
  "status": "active|expired|cancelled|closed|terminated",
  "category": "subscription|insurance|utilities|rent|services|software|maintenance|other",
  "amount": 99.99,
  "currency": "USD|EUR|GBP|...",
  "frequency": "weekly|bi-weekly|monthly|quarterly|yearly|one-time",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "payDate": "2024-01-15",
  "description": "Contract description",
  "notes": "Additional notes",
  "documentLink": "https://example.com/contract.pdf",
  "tags": ["tag1", "tag2"],
  "needsMoreInfo": false,
  "contactInfo": {
    "contactPerson": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "website": "https://example.com",
    "address": "123 Main St, City, Country"
  },
  "customFields": {
    "customKey": "customValue"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Error Response Format**

```json
{
  "error": "Error message description"
}
```

### **Export Response Format**

#### **Individual Export Response**
```json
{
  "totalContracts": 5,
  "exportDate": "2024-01-01T12:00:00.000Z",
  "files": [
    {
      "filename": "CONTRACT-001.md",
      "contractId": "CONTRACT-001",
      "size": 1024
    }
  ],
  "message": "Successfully exported 5 contracts as individual markdown files"
}
```

## 🔍 Search and Filtering

### **Search Parameters**

The search functionality searches across multiple fields:
- Contract name
- Company name
- Contract ID
- Description
- Tags
- Notes
- Custom fields (all values)
- Document link

### **Filter Parameters**

- **status**: Filter by contract status
  - `active` - Currently active contracts
  - `expired` - Expired contracts
  - `cancelled` - Cancelled contracts
  - `closed` - Closed contracts
  - `terminated` - Terminated contracts

- **category**: Filter by contract category
  - `subscription` - Subscription services
  - `insurance` - Insurance policies
  - `utilities` - Utility services
  - `rent` - Rental agreements
  - `services` - Professional services
  - `software` - Software licenses
  - `maintenance` - Maintenance contracts
  - `other` - Other contract types

### **Combined Filters**

You can combine multiple filters for precise results:

```bash
# Active software contracts
curl "http://localhost:3001/api/contracts?status=active&category=software"

# Expired contracts containing "insurance"
curl "http://localhost:3001/api/contracts?status=expired&search=insurance"
```

## 🚀 Performance Considerations

### **Pagination**
Currently, the API returns all results. For large datasets, consider implementing pagination in future versions.

### **Caching**
The API doesn't implement caching by default. Consider implementing client-side caching for frequently accessed data.

### **Rate Limiting**
No rate limiting is currently implemented. Consider implementing rate limiting for production use.

## 🔐 Security

### **Authentication**
The API supports optional **single shared-password** authentication, enabled by setting the `APP_PASSWORD` environment variable.

- **Disabled by default** (`APP_PASSWORD` unset): all endpoints are open. Suitable for local use or when a reverse proxy (e.g. nginx basic auth) protects the app.
- **Enabled** (`APP_PASSWORD` set): clients authenticate via `POST /api/auth/login` with `{ "password": "..." }`. On success the server sets an `HttpOnly`, `SameSite=Lax` session cookie containing an HMAC-signed, stateless token (7-day expiry, no server-side session store). All routes except `/api/health` and `/api/auth/*` then require this cookie and return `401 Unauthorized` without it.

**Machine clients** (backup cron, CI, scripts) can authenticate without the login round-trip by setting `API_TOKEN` and sending it as `Authorization: Bearer <token>` or `X-API-Key: <token>`. This is a separate credential from `APP_PASSWORD` and can be rotated independently. It is only enforced when `APP_PASSWORD` is also set.

Relevant environment variables:

| Variable | Description |
|----------|-------------|
| `APP_PASSWORD` | Shared login password. Empty disables auth. |
| `SESSION_SECRET` | Secret used to sign session cookies (falls back to a value derived from `APP_PASSWORD`). Use a long random string. |
| `API_TOKEN` | Token for machine clients via `Authorization: Bearer` / `X-API-Key`. Only enforced when `APP_PASSWORD` is set. |
| `NODE_ENV` | Set to `production` to add the `Secure` flag to cookies (use over HTTPS). |
| `APP_ORIGIN` | Comma-separated allowed browser origins for CORS with credentials. Empty reflects the request origin. |

Example (browser-style, session cookie):
```bash
# Check status
curl -s http://localhost:3001/api/auth/status

# Log in and store the session cookie
curl -s -c cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' \
  http://localhost:3001/api/auth/login

# Use the cookie on subsequent requests
curl -s -b cookies.txt http://localhost:3001/api/contracts
```

Example (machine client, API token):
```bash
# One-shot request with a bearer token (e.g. a backup cron)
curl -fsSLo backup.json \
  -H "Authorization: Bearer ${API_TOKEN}" \
  https://contracts.yourdomain.com/api/contracts/export/json
```

For multi-user accounts, JWTs, or OAuth 2.0 / OIDC, consider extending this mechanism.

### **HTTPS**
Always use HTTPS in production to encrypt data in transit.

### **Input Validation**
The API validates all input data to prevent injection attacks and ensure data integrity.

## 🧪 Testing

### **Health Check**
```bash
# Check API health
curl http://localhost:3001/api/health
```

### **Test Data**
Use the provided test data to experiment with the API:
```bash
# Load test data
task load-test-data

# Test export functionality
task test-export-markdown
```

## 📚 Related Documentation

- **[Export Documentation](export.md)** - Detailed export functionality guide
- **[README.md](../README.md)** - Project overview and quick start
- **[Example Configuration](../example/)** - Docker and nginx setup examples
