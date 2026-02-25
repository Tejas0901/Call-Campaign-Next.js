# Testing the Campaign Search Integration

## Overview

This document provides instructions to test the newly integrated Campaign Search API functionality.

## Prerequisites

- Ensure your backend API is running at `NEXT_PUBLIC_API_BASE_URL`
- Ensure your tenant ID is configured in `NEXT_PUBLIC_TENANT_ID`
- Ensure you have a valid authentication token in localStorage

## Test Scenarios

### 1. Basic Search

1. Navigate to `http://localhost:3000/campaigns/migrations`
2. You should see:
   - A search input field at the top
   - A "Filters" button with badge counter
   - Pagination controls (if applicable)
3. Type "developer" in the search box
4. Results should update automatically after 300ms (debounced)
5. Verify the results match "developer" in campaign name, job role, company, or location

### 2. Filter Functionality

1. Click the "Filters" button
2. You should see a popover with filter options:
   - Status: Draft, Active, Paused, Completed badges
   - Work Mode: Remote, Onsite, Hybrid badges
   - Job Type: Full Time, Contract, Part Time badges
   - Shift Type: Day, Night, Rotational, General badges
   - Interview Mode: Video, Telephonic, In Person badges
   - Walk-in Drive: Dropdown selector
   - CTC Negotiable: Dropdown selector
   - Audio Generated: Dropdown selector
   - CTC Range: Min/Max input fields
   - Experience Range: Min/Max input fields
   - Created Date Range: From/To date pickers
3. Select "Active" and "Remote" filters
4. Set CTC range: Min 10, Max 30
5. Click "Apply Filters"
6. Verify results match all criteria

### 3. Pagination

1. Apply filters that return more than 50 results
2. Verify pagination controls appear at bottom
3. Click "Next" button
4. Verify page 2 loads
5. Click "Previous" button
6. Verify page 1 loads again

### 4. Combined Search and Filters

1. Enter "python" in search box
2. Apply "Active" status filter
3. Set work mode to "Remote"
4. Set CTC min to 15
5. Verify results match all criteria (python AND active AND remote AND ctc>=15)

### 5. Clear Filters

1. Apply several filters
2. Click "Clear All" in the filter popover
3. Or click the "Filters" button and then "Clear" at bottom
4. Verify filters are cleared and all campaigns are shown

### 6. Migration Card Display

1. Verify each campaign card shows:
   - Campaign name/job role
   - Company name
   - Location
   - CTC range
   - Experience requirements
   - Contact counts
   - Status badge
   - Work mode badge
   - Job type badge

### 7. Error Handling

1. Ensure backend API is stopped
2. Try searching
3. Verify error message appears
4. Restart backend API
5. Try searching again
6. Verify results load properly

## Expected API Calls

When searching, you should see network requests to:

- `/api/campaigns/search?q=...&status=...&work_mode=...&page=1&page_size=50`

## Troubleshooting

### No search box appearing

- Verify you're on the `/campaigns/migrations` page
- Check browser console for JavaScript errors
- Ensure all dependencies are installed

### Filters not applying

- Check network tab for API request
- Verify tenant ID is set
- Check backend API is responding

### Search results not updating

- Verify debouncing is working (wait 300ms after typing)
- Check for network errors
- Ensure auth token is valid

### Pagination not working

- Apply filters that return >50 results
- Check if pagination metadata is received from API
- Verify page numbers are calculated correctly

## Success Criteria

- [ ] Search box appears on migrations page
- [ ] Filters button appears with proper UI
- [ ] Search results update in real-time
- [ ] Filters can be applied and cleared
- [ ] Pagination works correctly
- [ ] Campaign cards display all relevant information
- [ ] Loading states are shown appropriately
- [ ] Error handling works properly
- [ ] Both legacy and search results render correctly

## Known Limitations

- The initial page load shows legacy campaigns until search is initiated
- Some fields in legacy campaigns may show default values
- Backend API must support all filter parameters for full functionality

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify network requests in DevTools
3. Confirm environment variables are set
4. Ensure backend API is running and accessible
5. Review the full documentation at `CAMPAIGN_SEARCH_INTEGRATION.md`
