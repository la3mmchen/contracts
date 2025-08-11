# Export Functionality

The application provides comprehensive export capabilities to help you backup, share, and analyze your contract data.

## 📤 Markdown Export Features

### **1. Bulk Export (ZIP Archive)**
- **Endpoint**: `GET /api/contracts/export/markdown`
- **Format**: ZIP file containing individual markdown files for each contract
- **Use Case**: Complete backup of all contracts
- **File Naming**: Each contract gets its own file named `{contractId}.md`

### **2. Individual File Export**
- **Endpoint**: `GET /api/contracts/export/markdown/individual`
- **Format**: JSON response with file metadata and content
- **Use Case**: Programmatic access to individual contract exports
- **Response**: Includes filename, contract ID, file size, and total count

### **3. Filtered Exports**
- **By Status**: `?status=active|expired|cancelled|closed`
- **By Search**: `?search=query` (searches name, company, description, tags)
- **Combined**: Can combine filters for precise exports

## 📋 Export Content Structure

Each exported markdown file includes:

### **Contract Details**
- Contract name, ID, and company
- Status, category, and frequency
- Amount and currency
- Start/end dates and payment dates
- Description and notes

### **Contact Information**
- Contact person
- Email, phone, website
- Physical address

### **Additional Data**
- Tags and categories
- Document links
- Price change history (if available)
- Creation and update timestamps

### **Export Metadata**
- Generation date and time
- Total contract count
- Status-based grouping
- Summary tables

## 🎯 Export Use Cases

### **Backup & Recovery**
```bash
# Daily backup of all contracts
curl -o "contracts-backup-$(date +%Y%m%d).zip" \
  "http://localhost:3001/api/contracts/export/markdown"
```

### **Status-based Analysis**
```bash
# Export active contracts for budget planning
curl -o active-contracts.zip \
  "http://localhost:3001/api/contracts/export/markdown?status=active"

# Export expired contracts for review
curl -o expired-contracts.zip \
  "http://localhost:3001/api/contracts/export/markdown?status=expired"
```

### **Category-based Reports**
```bash
# Export all subscription contracts
curl -o subscriptions.zip \
  "http://localhost:3001/api/contracts/export/markdown?category=subscription"
```

### **Search-based Exports**
```bash
# Export contracts related to specific services
curl -o service-contracts.zip \
  "http://localhost:3001/api/contracts/export/markdown?search=software"
```

## 📁 Export File Formats

### **ZIP Archive Export**
- **Content**: Individual markdown files for each contract
- **Structure**: Organized by contract ID
- **Additional**: README file with export summary
- **Use**: Complete backup and sharing

### **Individual File Export**
- **Content**: JSON response with file metadata
- **Structure**: Array of file information
- **Use**: API integration and programmatic access

## 🔧 API Endpoints

### **Export Endpoints**
- `GET /api/contracts/export/markdown` - Export all contracts to Markdown (ZIP with individual files)
- `GET /api/contracts/export/markdown/individual` - Export contracts as individual markdown files (JSON response)
- `GET /api/contracts/export/markdown?status=active` - Export filtered contracts to Markdown
- `GET /api/contracts/export/markdown?search=query` - Export search results to Markdown

### **Example API Usage**
```bash
# Export all contracts to Markdown file (ZIP archive)
curl -o contracts-backup.zip http://localhost:3001/api/contracts/export/markdown

# Export contracts as individual markdown files (JSON response)
curl -s "http://localhost:3001/api/contracts/export/markdown/individual" | jq .

# Export only active contracts
curl -o active-contracts.zip \
  "http://localhost:3001/api/contracts/export/markdown?status=active"

# Search and export matching contracts
curl -o search-results.zip \
  "http://localhost:3001/api/contracts/export/markdown?search=netflix"
```

## 💡 Export Best Practices

1. **Regular Backups**: Export all contracts weekly/monthly
2. **Filtered Exports**: Use status filters for specific analysis
3. **Search Exports**: Export subsets for focused reviews
4. **File Naming**: Include dates in backup filenames
5. **Storage**: Keep exports in secure, accessible locations

## 🧪 Testing Export Functionality

Use the provided task command to test the export functionality:

```bash
# Test Markdown export feature (ZIP and individual files)
task test-export-markdown
```

This will test both the bulk export (ZIP) and individual file export endpoints to ensure they're working correctly.
