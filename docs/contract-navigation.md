# Contract Navigation Feature

## Overview

The contract navigation feature allows users to navigate through filtered contracts seamlessly. When you're viewing a contract detail page, you can navigate to the next or previous contract in the same filtered list using navigation buttons or keyboard shortcuts.

## How It Works

### 1. Filter Context Preservation
- When you apply filters on the main contracts page, the filter state is preserved in the URL
- When you navigate to a contract detail page, the navigation system uses the same filtered list
- This means you can navigate through contracts that match your current filter criteria

### 2. Navigation Controls
The navigation bar appears below the header when there are multiple contracts in the filtered list:

- **Position Indicator**: Shows "X of Y" where you are in the list
- **Navigation Buttons**:
  - ⏮️ First: Go to the first contract in the filtered list
  - ◀️ Previous: Go to the previous contract
  - ▶️ Next: Go to the next contract
  - ⏭️ Last: Go to the last contract in the filtered list
- **List Button**: Return to the main contracts view
- **Contract Preview**: Shows names of previous/next contracts (on larger screens)
- **Keyboard Shortcuts**: Displays available keyboard shortcuts

### 3. Keyboard Navigation
When not editing, you can use these keyboard shortcuts:

- **Arrow Keys**: 
  - `←` (Left Arrow): Previous contract
  - `→` (Right Arrow): Next contract
- **Navigation Keys**:
  - `Home`: First contract
  - `End`: Last contract
- **Escape**: Return to main view (when not editing)

### 4. Filter Context Display
The navigation bar shows:
- Total number of contracts in the filtered list
- Current filter parameters (if any are applied)
- Your current position in the list

## Use Cases

### Scenario 1: Reviewing Active Contracts
1. Filter contracts by status "active"
2. Navigate to the first active contract
3. Use navigation buttons to review each active contract
4. Make quick edits or updates as needed
5. Navigate through all active contracts without returning to the list

### Scenario 2: Category Review
1. Filter contracts by category (e.g., "utilities")
2. Navigate through all utility contracts
3. Compare terms, amounts, and renewal dates
4. Identify contracts that need attention

### Scenario 3: Search Results Navigation
1. Search for contracts containing "insurance"
2. Navigate through search results
3. Review each matching contract
4. Make decisions based on the search results

## Benefits

1. **Efficient Workflow**: No need to go back to the main list between contracts
2. **Context Preservation**: Always know which filtered list you're navigating through
3. **Keyboard Friendly**: Quick navigation using keyboard shortcuts
4. **Visual Feedback**: Clear indication of position and available navigation options
5. **Filter Awareness**: See what filters are currently applied

## Technical Details

- Navigation state is preserved in the URL
- Filter context is reconstructed from URL parameters
- Navigation works with all filter types (status, category, tags, search, etc.)
- Keyboard navigation is disabled during editing to prevent accidental navigation
- Navigation bar only appears when there are multiple contracts to navigate through

## Tips

1. **Use keyboard shortcuts** for faster navigation
2. **Check the filter context** to ensure you're navigating through the right list
3. **Use the List button** to return to the main view and change filters
4. **Navigate efficiently** by using First/Last buttons for quick jumps
5. **Preserve your work** by saving any edits before navigating away
