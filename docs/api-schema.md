# Contracts API Schema Documentation

## Overview

The Contracts API provides a RESTful interface for managing contract data. It supports CRUD operations on contracts, search functionality, data export, and statistical information.

**Base URL**: `/api/contracts`

## Data Types

### Contract

The main contract entity representing a business agreement or subscription.

```typescript
interface Contract {
  id: string;                    // Unique identifier (UUID)
  contractId: string;            // Business contract identifier
  name: string;                  // Contract name
  company: string;               // Company providing the service
  description?: string;          // Optional description
  startDate: string;             // Contract start date (ISO 8601)
  endDate?: string;              // Optional end date (ISO 8601)
  amount: number;                // Contract amount
  currency: string;              // Currency code (e.g., "USD", "EUR")
  frequency: ContractFrequency;  // Payment frequency
  status: ContractStatus;        // Current contract status
  category: ContractCategory;    // Contract category
  payDate?: string;              // Calculated next payment date
  contactInfo: ContactInfo;      // Contact information
  notes?: string;                // Optional notes
  tags?: string[];               // Optional tags for categorization
  needsMoreInfo?: boolean;       // Flag indicating incomplete information
  pinned?: boolean;              // Flag to pin contract to top of list
  priceChanges?: PriceChange[];  // History of price changes
  attachments?: ContractAttachment[]; // Associated files
  documentLink?: string;         // Link to contract document
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
}
```

### ContractFrequency

```typescript
type ContractFrequency = 
  | 'monthly' 
  | 'quarterly' 
  | 'yearly' 
  | 'one-time' 
  | 'weekly' 
  | 'bi-weekly';
```

### ContractStatus

```typescript
type ContractStatus = 
  | 'active' 
  | 'expired' 
  | 'cancelled' 
  | 'terminated' 
  | 'closed';
```

### ContractCategory

```typescript
type ContractCategory = 
  | 'subscription' 
  | 'insurance' 
  | 'utilities' 
  | 'rent' 
  | 'services' 
  | 'software' 
  | 'maintenance' 
  | 'other';
```

### ContactInfo

```typescript
interface ContactInfo {
  email?: string;        // Contact email
  phone?: string;        // Contact phone number
  address?: string;      // Physical address
  website?: string;      // Company website
  contactPerson?: string; // Primary contact person
}
```

### PriceChange

```typescript
interface PriceChange {
  date: string;          // Date of price change
  previousAmount: number; // Previous contract amount
  newAmount: number;     // New contract amount
  reason: string;        // Reason for price change
  effectiveDate: string; // When the change takes effect
}
```

### ContractAttachment

```typescript
interface ContractAttachment {
  id: string;            // Unique identifier
  name: string;          // File name
  type: string;          // File type/MIME type
  size: number;          // File size in bytes
  url?: string;          // Optional file URL
  uploadedAt: string;    // Upload timestamp
}
```

### CreateContractRequest

```typescript
interface CreateContractRequest {
  contractId: string;    // Business contract identifier
  name: string;          // Contract name
  company: string;       // Company providing the service
  description?: string;  // Optional description
  startDate: string;     // Contract start date
  endDate?: string;      // Optional end date
  amount: number;        // Contract amount
  currency: string;      // Currency code
  frequency: ContractFrequency;
  status: ContractStatus;
  category: ContractCategory;
  payDate?: string;      // Calculated payment date
  contactInfo: ContactInfo;
  notes?: string;        // Optional notes
  tags?: string[];       // Optional tags
  needsMoreInfo?: boolean;
  pinned?: boolean;
  priceChanges?: PriceChange[];
}
```

### UpdateContractRequest

```typescript
interface UpdateContractRequest extends Partial<CreateContractRequest> {
  id: string;            // Contract ID to update
}
```

## API Endpoints

### 1. Get All Contracts

**GET** `/api/contracts`

Retrieves all contracts with optional filtering.

#### Query Parameters

- `search` (optional): Search contracts by name, company, or description
- `status` (optional): Filter by contract status

#### Example Request

```bash
# Get all contracts
GET /api/contracts

# Search contracts
GET /api/contracts?search=netflix

# Filter by status
GET /api/contracts?status=active
```

#### Response

```json
[
  {
    "id": "uuid-here",
    "contractId": "NETFLIX-001",
    "name": "Netflix Premium",
    "company": "Netflix Inc.",
    "amount": 15.99,
    "currency": "USD",
    "frequency": "monthly",
    "status": "active",
    "category": "subscription",
    "startDate": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 2. Get Contract by ID

**GET** `/api/contracts/:id`

Retrieves a specific contract by its ID.

#### Path Parameters

- `id`: Contract UUID

#### Example Request

```bash
GET /api/contracts/uuid-here
```

#### Response

```json
{
  "id": "uuid-here",
  "contractId": "NETFLIX-001",
  "name": "Netflix Premium",
  "company": "Netflix Inc.",
  "description": "Premium streaming subscription",
  "startDate": "2024-01-01T00:00:00.000Z",
  "amount": 15.99,
  "currency": "USD",
  "frequency": "monthly",
  "status": "active",
  "category": "subscription",
  "contactInfo": {
    "email": "support@netflix.com",
    "website": "https://netflix.com"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 3. Create Contract

**POST** `/api/contracts`

Creates a new contract.

#### Request Body

```json
{
  "contractId": "NETFLIX-001",
  "name": "Netflix Premium",
  "company": "Netflix Inc.",
  "description": "Premium streaming subscription",
  "startDate": "2024-01-01T00:00:00.000Z",
  "amount": 15.99,
  "currency": "USD",
  "frequency": "monthly",
  "status": "active",
  "category": "subscription",
  "contactInfo": {
    "email": "support@netflix.com",
    "website": "https://netflix.com"
  }
}
```

#### Required Fields

- `contractId`
- `name`
- `company`
- `startDate`
- `amount`
- `currency`
- `frequency`
- `status`
- `category`
- `contactInfo`

#### Response

```json
{
  "created": true,
  "contract": {
    "id": "generated-uuid",
    "contractId": "NETFLIX-001",
    "name": "Netflix Premium",
    "company": "Netflix Inc.",
    "startDate": "2024-01-01T00:00:00.000Z",
    "amount": 15.99,
    "currency": "USD",
    "frequency": "monthly",
    "status": "active",
    "category": "subscription",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Contract

**PUT** `/api/contracts/:id`

Updates an existing contract.

#### Path Parameters

- `id`: Contract UUID

#### Request Body

Partial update - only include fields to change:

```json
{
  "amount": 19.99,
  "notes": "Price increased due to premium features"
}
```

#### Response

Returns the updated contract object.

### 5. Delete Contract

**DELETE** `/api/contracts/:id`

Deletes a contract.

#### Path Parameters

- `id`: Contract UUID

#### Response

- **204 No Content**: Contract successfully deleted
- **404 Not Found**: Contract not found

### 6. Get Data Storage Info

**GET** `/api/contracts/info/data`

Retrieves information about the data storage.

#### Response

```json
{
  "dataDirectory": "/path/to/data",
  "contractsDirectory": "/path/to/data/contracts",
  "totalFiles": 25,
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 7. Get Contract Statistics

**GET** `/api/contracts/info/stats`

Retrieves statistical information about contracts.

#### Response

```json
{
  "totalContracts": 25,
  "activeContracts": 20,
  "expiredContracts": 3,
  "cancelledContracts": 2,
  "totalValue": 1250.50,
  "averageValue": 50.02,
  "byCategory": {
    "subscription": 15,
    "utilities": 5,
    "insurance": 3,
    "other": 2
  },
  "byFrequency": {
    "monthly": 18,
    "yearly": 5,
    "quarterly": 2
  }
}
```

### 8. Export Contracts to Markdown (ZIP)

**GET** `/api/contracts/export/markdown`

Exports all contracts to individual markdown files in a ZIP archive.

#### Query Parameters

- `search` (optional): Search contracts before export
- `status` (optional): Filter by status before export

#### Response

Returns a ZIP file containing individual markdown files for each contract.

#### Headers

- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="contracts-export-YYYY-MM-DD.zip"`

### 9. Export Contracts to Individual Markdown Files

**GET** `/api/contracts/export/markdown/individual`

Returns metadata about individual markdown exports without downloading files.

#### Response

```json
{
  "totalContracts": 25,
  "exportDate": "2024-01-01T00:00:00.000Z",
  "files": [
    {
      "filename": "netflix-premium.md",
      "contractId": "netflix-premium",
      "size": 1024
    }
  ],
  "message": "Successfully exported 25 contracts as individual markdown files"
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content to return
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Example Error Response

```json
{
  "error": "Name, company, and contract ID are required"
}
```

## Data Validation

### Required Fields for Contract Creation

- `contractId`: Must be unique business identifier
- `name`: Non-empty string
- `company`: Non-empty string
- `startDate`: Valid ISO 8601 date string
- `amount`: Positive number
- `currency`: Valid currency code
- `frequency`: Must be one of the defined frequency values
- `status`: Must be one of the defined status values
- `category`: Must be one of the defined category values
- `contactInfo`: Object with at least one contact method

### Date Format

All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Currency Format

Currency should be a 3-letter ISO currency code (e.g., "USD", "EUR", "GBP")

## Usage Examples

### Creating a Monthly Subscription

```bash
curl -X POST http://localhost:3000/api/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "SPOTIFY-001",
    "name": "Spotify Premium",
    "company": "Spotify AB",
    "description": "Premium music streaming service",
    "startDate": "2024-01-01T00:00:00.000Z",
    "amount": 9.99,
    "currency": "USD",
    "frequency": "monthly",
    "status": "active",
    "category": "subscription",
    "contactInfo": {
      "email": "support@spotify.com",
      "website": "https://spotify.com"
    }
  }'
```

### Searching for Active Contracts

```bash
curl "http://localhost:3000/api/contracts?status=active"
```

### Updating Contract Amount

```bash
curl -X PUT http://localhost:3000/api/contracts/uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 12.99,
    "notes": "Price increased for family plan"
  }'
```

### Exporting Contracts

```bash
# Download ZIP file
curl -O -J "http://localhost:3000/api/contracts/export/markdown"

# Get export metadata
curl "http://localhost:3000/api/contracts/export/markdown/individual"
```

## Notes

- All timestamps are in UTC
- Contract IDs should be unique business identifiers
- The API automatically generates UUIDs for internal use
- Pinned contracts appear first in list responses
- Search is case-insensitive and matches against name, company, and description
- Export functionality creates individual markdown files for each contract
- File attachments are stored as metadata; actual file storage is handled separately
