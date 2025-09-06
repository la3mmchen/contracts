# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a **contracts management system** with a React frontend and Node.js/Express backend. The system helps users organize contracts, track spending, and maintain visibility of contract statuses. It stores data as individual JSON files on disk and supports export/backup functionality.

## Architecture

### Core Structure
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js + Express + TypeScript with file-based JSON storage
- **Data Storage**: Individual JSON files in `./data/contracts/` directory
- **Deployment**: Docker containers with docker-compose orchestration

### Key Components
- **Contract Management**: Full CRUD operations with rich data model including price tracking, notes history, and custom fields
- **File-Based Storage**: Each contract stored as individual JSON file using UUID as filename
- **Export System**: Markdown (ZIP) and JSON backup formats with filtering support
- **Configuration**: Runtime environment variable configuration for categories, statuses, frequencies, and currencies

## Development Commands

### Primary Workflow (using Taskfile)
```bash
# Build and run full application
task run

# Stop all services
task stop

# View logs from all containers
task logs

# View specific service logs
task logs-api
task logs-app

# Check application health
task health
```

### Docker Operations
```bash
# Build both images
task build

# Clean up everything
task clean
```

### Data Management
```bash
# Load sample contracts for testing
task load-test-data

# Remove only test contracts
task clear-test-data

# Get storage information
task data-info

# Get file statistics
task file-stats
```

### Export Testing
```bash
# Test Markdown export (creates ZIP files)
task test-export-markdown

# Test JSON backup functionality
task test-backup
```

### Direct Development
```bash
# Frontend development (client/)
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run lint         # ESLint check

# Backend development (api/)
npm run dev          # Start with nodemon on :3001
npm run build        # TypeScript compilation
npm start            # Run compiled version
```

## Architecture Details

### Data Model
The core `Contract` interface (api/src/types/contract.ts) includes:
- Basic contract info (name, company, amount, dates)
- Complex fields: price change history, notes history, custom fields
- Metadata: flags for drafts, optimization hints, family member assignments
- Relationship tracking: connected contracts via contractId references

### Storage Pattern
- Each contract saved as individual JSON file in `/data` volume
- Filename pattern: `{uuid}.json`
- No database - pure file-based storage
- Automatic backup/restore capabilities via API

### Configuration System
Runtime configuration via environment variables:
- `CONTRACTS_CATEGORIES`: Comma-separated categories
- `CONTRACTS_STATUSES`: Contract status options
- `CONTRACTS_FREQUENCIES`: Payment frequency options  
- `CONTRACTS_CURRENCIES`: Supported currencies (EUR default)
- Frontend rebuilds config at startup, no container rebuild needed

### Export Architecture
Two export formats:
1. **Markdown Export**: ZIP archive with individual .md files per contract
2. **JSON Backup**: Full system backup with metadata for restoration

### API Design
RESTful API with filtering, search, and export endpoints:
- Core CRUD: `/api/contracts`
- Search: `/api/contracts?search=query`
- Filtering: `/api/contracts?status=active&category=subscription`
- Exports: `/api/contracts/export/{markdown|json}`

## Testing Data
- Sample contracts available via `task load-test-data`
- Comprehensive test data includes all contract types, statuses, and edge cases
- Specific test contract IDs for cleanup: `SOFT-2024-006`, `UTL-2024-003`, etc.

## Development Notes

### File Structure Significance
- `api/src/types/contract.ts`: Complete data model definition
- `client/src/components/`: React components using shadcn/ui pattern
- `docker-compose.yml`: Local development environment
- `Taskfile.yml`: Primary development workflow automation

### Key Technical Constraints
- File-based storage only - no database
- Docker-first development workflow
- Runtime configuration without rebuilds
- Individual JSON files per contract for data integrity

### Demo Mode
Application supports demo mode for GitHub Pages deployment with embedded test data when no API server is available.

## Environment Configuration

### Local Development
Default ports: Frontend :3000, API :3001
Data persisted in `./data/contracts/` relative to project root

### Production Deployment
Uses GitHub Container Registry images:
- `ghcr.io/la3mmchen/contracts-app:latest`
- `ghcr.io/la3mmchen/contracts-api:latest`

### Environment Variables
Reference the docker-compose.yml for complete configuration options. Key variables:
- `API_URL`: Backend endpoint for frontend
- `CONTRACTS_DATA_DIR`: Storage directory for backend
- Configuration arrays for categories, statuses, frequencies, currencies
