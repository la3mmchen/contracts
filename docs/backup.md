# Backup & Restore Documentation

This document describes how to create backups of your contracts data and restore from them when needed.

## 🔄 Overview

The contracts application provides multiple export formats for creating backups:
- **JSON Backup** - Complete data backup with metadata (recommended for restoration)
- **Markdown Export** - Human-readable format for documentation
- **Individual Files** - Separate files for each contract

## 📤 Creating Backups

### **JSON Backup (Recommended)**

The JSON backup format is the most comprehensive and is designed specifically for backup and restoration purposes.

#### **Full System Backup**
```bash
# Export all contracts with metadata
curl -o contracts-backup-$(date +%Y%m%d).json \
  http://localhost:3001/api/contracts/export/json
```

#### **Filtered Backups**
```bash
# Active contracts only
curl -o active-contracts-backup.json \
  "http://localhost:3001/api/contracts/export/json?status=active"

# Specific category
curl -o subscription-backup.json \
  "http://localhost:3001/api/contracts/export/json?category=subscription"

# Specific frequency
curl -o monthly-contracts-backup.json \
  "http://localhost:3001/api/contracts/export/json?frequency=monthly"

# Search-based backup
curl -o netflix-backup.json \
  "http://localhost:3001/api/contracts/export/json?search=netflix"
```

#### **Combined Filters**
```bash
# Active subscription contracts
curl -o active-subscriptions-backup.json \
  "http://localhost:3001/api/contracts/export/json?status=active&category=subscription"

# Monthly utilities
curl -o monthly-utilities-backup.json \
  "http://localhost:3001/api/contracts/export/json?frequency=monthly&category=utilities"
```

### **Markdown Export**

For human-readable documentation or sharing with non-technical users:

```bash
# Export all contracts to markdown (ZIP file)
curl -o contracts-documentation.zip \
  http://localhost:3001/api/contracts/export/markdown

# Export filtered contracts
curl -o active-contracts-docs.zip \
  "http://localhost:3001/api/contracts/export/markdown?status=active"
```

### **Individual Contract Files**

For granular access to individual contracts:

```bash
# Get list of individual files
curl -s "http://localhost:3001/api/contracts/export/markdown/individual" | jq .
```

## 📁 Backup File Structure

### **JSON Backup Format**

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
      "endDate": null,
      "payDate": "2024-01-15",
      "description": "Premium streaming subscription",
      "notes": "Family plan with 4 accounts",
      "tags": ["streaming", "entertainment", "family"],
      "needsMoreInfo": false,
      "pinned": false,
      "draft": false,
      "contactInfo": {
        "email": "support@netflix.com",
        "phone": "+1-800-456-9374",
        "website": "https://netflix.com"
      },
      "customFields": {
        "Account Email": "family@example.com",
        "Login URL": "https://netflix.com/account"
      },
      "priceChanges": [
        {
          "date": "2024-09-01T00:00:00.000Z",
          "previousAmount": 14.99,
          "newAmount": 15.99,
          "reason": "Annual price adjustment",
          "effectiveDate": "2024-09-01T00:00:00.000Z"
        }
      ],
      "attachments": [],
      "documentLink": "https://drive.google.com/file/d/123/view",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🔄 Restoring from Backup

### **Current Status**

**Note:** The import/restore functionality is currently in development. For now, you can:

1. **Use the backup as reference** - View the data structure and content
2. **Manual restoration** - Copy data from backup files manually
3. **API recreation** - Use the backup data to recreate contracts via the API

### **Planned Import Endpoint**

```bash
# Future functionality (not yet implemented)
curl -X POST http://localhost:3001/api/contracts/import \
  -H "Content-Type: application/json" \
  -d @contracts-backup-20240115.json
```

### **Manual Restoration Process**

1. **Review backup file** - Ensure data integrity and completeness
2. **Prepare environment** - Ensure API is running and accessible
3. **Recreate contracts** - Use individual contract data to recreate via API
4. **Verify restoration** - Check that all contracts are properly restored

## 📅 Backup Strategy Recommendations

### **Regular Backups**
- **Daily**: Active contracts only (quick backup)
- **Weekly**: Full system backup
- **Monthly**: Full backup with verification

### **Event-Based Backups**
- **Before major changes** - System updates, migrations
- **After data imports** - New contract batches
- **Before maintenance** - Server updates, deployments

### **Backup Naming Convention**
```bash
# Recommended naming pattern
contracts-backup-YYYYMMDD-HHMMSS.json
contracts-backup-YYYYMMDD-HHMMSS-status-active.json
contracts-backup-YYYYMMDD-HHMMSS-category-subscription.json
```

### **Storage Recommendations**
- **Local storage** - For immediate access
- **Cloud storage** - For disaster recovery
- **Multiple locations** - Redundancy for critical data
- **Version control** - Keep multiple backup versions

## 🛡️ Data Security

### **Backup File Security**
- **Encrypt sensitive data** - If contracts contain confidential information
- **Secure storage** - Protect backup files with appropriate access controls
- **Regular rotation** - Remove old backup files to prevent data accumulation

### **Access Control**
- **Limit backup access** - Only authorized users should access backup files
- **Audit logging** - Track who creates and accesses backups
- **Secure transmission** - Use HTTPS for all backup operations

## 🔍 Troubleshooting

### **Common Issues**

#### **Backup Fails**
```bash
# Check API health
curl http://localhost:3001/api/health

# Check data directory permissions
curl http://localhost:3001/api/contracts/info/data
```

#### **Large Backup Files**
- **Filter by date** - Export only recent contracts
- **Filter by status** - Export only active contracts
- **Use compression** - Compress backup files for storage

#### **Backup Validation**
```bash
# Verify backup file integrity
jq . contracts-backup.json > /dev/null

# Check contract count
jq '.metadata.totalContracts' contracts-backup.json

# Validate data structure
jq '.contracts[0]' contracts-backup.json
```

## 📚 Related Documentation

- **[API Documentation](api.md)** - Complete API reference
- **[Export Documentation](export.md)** - Detailed export examples
- **[README](../README.md)** - Project overview and setup

## 🆘 Support

If you encounter issues with backup creation or restoration:

1. **Check the logs** - Review API server logs for errors
2. **Verify data integrity** - Ensure contracts data is accessible
3. **Test with small exports** - Try exporting single contracts first
4. **Check API endpoints** - Verify all endpoints are responding

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** JSON backup implemented, import functionality in development
