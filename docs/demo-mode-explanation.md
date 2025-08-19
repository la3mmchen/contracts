# Demo Mode: How It Works Without an API

## Overview

Your contracts application is designed to work seamlessly both with and without a backend API. When deployed to GitHub Pages (or any static hosting), it automatically detects the absence of an API and switches to **Demo Mode**.

## What Happens When No API is Available

### 1. **Automatic Detection**
- App tries to connect to `/api/health` endpoint
- If connection fails, automatically switches to demo mode
- No user intervention required

### 2. **Demo Data Loading**
- 8 realistic sample contracts are loaded
- Covers all major categories: subscriptions, insurance, utilities, rent, services, software, maintenance
- Includes various currencies (EUR, USD) and frequencies (monthly, yearly, quarterly)

### 3. **Full Functionality Maintained**
- ✅ **Create**: Add new contracts (stored in memory)
- ✅ **Read**: View and search all contracts
- ✅ **Update**: Edit existing contracts
- ✅ **Delete**: Remove contracts
- ✅ **Search & Filter**: All filtering options work
- ✅ **Export**: Download contracts as markdown
- ✅ **Statistics**: Charts and insights display correctly

### 4. **Visual Indicators**
- **Demo Mode Banner**: Clear indication when running without API
- **Connection Status**: Shows "Demo Mode" instead of API status
- **Toast Messages**: Inform users about demo limitations

## Sample Demo Data

The demo includes realistic contracts like:

| Contract | Company | Amount | Frequency | Category |
|----------|---------|---------|-----------|----------|
| Netflix Subscription | Netflix Inc. | $15.99 | Monthly | Subscription |
| Spotify Premium | Spotify AB | €9.99 | Monthly | Subscription |
| Gym Membership | Fitness First | €49.99 | Monthly | Services |
| Internet Service | Telekom | €39.99 | Monthly | Utilities |
| Car Insurance | Allianz | €299.99 | Yearly | Insurance |
| Office Rent | WeWork | €299.99 | Monthly | Rent |
| Software License | Adobe | €52.99 | Monthly | Software |
| HVAC Maintenance | Climate Control Ltd | €89.99 | Quarterly | Maintenance |

## Technical Implementation

### Smart API Service
```typescript
// Automatically chooses between real API and demo data
const activeApi = await this.getActiveApi();
return activeApi.getContracts(search, status);
```

### Dynamic Demo Data Loading
Instead of hardcoded demo contracts, the app now:
1. **Dynamically loads** contracts from `test-data/contracts/` folder
2. **Uses your existing test data** (netflix.json, spotify.json, etc.)
3. **Adds demo IDs** to make them unique in the demo environment
4. **Falls back gracefully** if test data cannot be loaded

### Fallback Strategy
1. **Primary**: Try to connect to real API
2. **Secondary**: Load contracts from test-data folder
3. **Fallback**: Use minimal demo contract if loading fails
4. **Caching**: API availability checked every 5 minutes
5. **Seamless**: Users don't notice the switch

### Demo Data Storage
- **Dynamic Loading**: Contracts loaded from test-data folder
- **Single Source of Truth**: No duplication between test data and demo
- **Realistic**: Uses your actual test contracts with all fields
- **Maintainable**: Update test data, demo automatically reflects changes

## User Experience

### What Users See
- **Demo Mode Banner**: Clear indication of current mode
- **Full App Functionality**: No feature limitations
- **Sample Data**: Realistic examples to explore
- **Responsive Design**: Works on all devices

### What Users Can Do
- Explore all app features
- Create, edit, and delete contracts
- Search and filter data
- Export contracts
- View statistics and charts
- Experience the complete UI/UX

### Limitations in Demo Mode
- **No Persistence**: Changes lost on refresh
- **No Real Data**: Working with sample contracts
- **No Backend**: All operations are simulated
- **No Sharing**: Data stays local to browser

## Benefits of Demo Mode

### For Users
- **No Setup Required**: Works immediately
- **Full Experience**: See all features in action
- **No Risk**: Safe to experiment and explore
- **Always Available**: Works 24/7 without maintenance

### For Developers
- **Easy Testing**: Test UI without backend
- **Demo Deployment**: Showcase app functionality
- **User Feedback**: Get input on features
- **Marketing**: Live demo for potential users

## Switching Between Modes

### Demo → Live
1. Start your API server locally
2. Refresh the page
3. App automatically detects API
4. Banner disappears, real data loads

### Live → Demo
1. Stop your API server
2. Refresh the page
3. App automatically falls back to demo
4. Demo banner appears

## Configuration

### Demo Mode Settings
- **API Check Interval**: 5 minutes (configurable)
- **Fallback Delay**: 300ms (simulates real API)
- **Sample Data**: 8 contracts (easily expandable)
- **Banner Display**: Automatic when API unavailable

### Customization Options
- Add more sample contracts
- Modify demo data structure
- Change fallback behavior
- Customize demo mode indicators

## Best Practices

### For Demo Users
- Explore all features freely
- Try different contract types
- Test search and filtering
- Export sample data

### For Developers
- Use demo mode for testing
- Test fallback scenarios
- Verify all features work
- Monitor API detection logic

## Troubleshooting Demo Mode

### Common Issues
1. **Demo data not loading**: Check browser console for errors
2. **Features not working**: Ensure all components use smart API
3. **Banner not showing**: Verify API availability detection
4. **Performance issues**: Check for memory leaks in demo data

### Debug Information
- Check browser console for API status
- Monitor network requests to `/api`
- Verify demo data loading
- Check component state management

---

**Demo Mode ensures your app is always functional, whether connected to an API or not. Users can experience the full feature set without any setup requirements!** 🚀
