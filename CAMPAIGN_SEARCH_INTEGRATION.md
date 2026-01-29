# Campaign Search API Integration

## Overview

This document describes the implementation of the Campaign Search API integration in your Next.js application. The integration provides comprehensive search, filtering, pagination, and sorting capabilities for campaigns.

## 📁 Files Created/Modified

### New Files Created

1. **`types/campaign.ts`** - Type definitions and utilities

   - `Campaign` interface (complete campaign data structure)
   - `CampaignSearchFilters` interface (all filter options)
   - `CampaignSearchResponse` interface (API response structure)
   - `buildCampaignSearchUrl()` helper function

2. **`app/api/campaigns/search/route.ts`** - Next.js API route

   - Proxies requests to backend search API
   - Handles query parameters
   - Manages authentication and tenant headers

3. **`hooks/useCampaignSearch.ts`** - React hook for search

   - Manages search state (campaigns, loading, error)
   - Handles pagination and filters
   - Provides `searchCampaigns()` and `resetSearch()` methods

4. **`components/campaigns/CampaignFilters.tsx`** - Filter UI component

   - Popover-based filter interface
   - Supports all filter types (status, work_mode, CTC range, etc.)
   - Shows active filter count badge
   - Apply/Clear functionality

5. **`components/campaigns/CampaignSearchCard.tsx`** - Campaign card component
   - Displays comprehensive campaign information
   - Supports all campaign fields from API
   - Status badges and indicators
   - Click to view details

### Modified Files

1. **`app/campaigns/page.tsx`** - Main campaigns page
   - Added search input with debouncing
   - Integrated filter component
   - Added pagination controls
   - Switches between regular and search views

## 🎯 Features Implemented

### 1. Text Search

- Global search across multiple fields (name, job role, company, location, etc.)
- Debounced input (300ms delay) for better performance
- Case-insensitive partial matching

### 2. Advanced Filters

**Multi-Select Filters:**

- Status (draft, active, paused, completed)
- Work Mode (remote, onsite, hybrid)
- Job Type (fulltime, contract, parttime)
- Shift Type (day, night, rotational, general)
- Interview Mode (video, telephonic, in_person)

**Boolean Filters:**

- Walk-in Drive (is_drive)
- CTC Negotiable
- Audio Generated
- Audio Approved

**Range Filters:**

- CTC Range (min/max)
- Experience Range (min/max years)
- Total Contacts (min/max)
- Completed Calls (min/max)

**Date Range Filters:**

- Created Date (from/to)
- Started Date (from/to)
- Completed Date (from/to)
- Drive Date (from/to)

### 3. Pagination

- Page size: 50 items per page (default)
- Previous/Next navigation buttons
- Shows current page and total pages
- Total campaign count display

### 4. Sorting

- Sort by: created_at, updated_at, name, job_role, status, total_contacts, completed_calls, min_ctc, max_ctc
- Sort order: asc/desc
- Can be extended in the filter component

## 💻 How to Use

### Basic Search

```typescript
// In your component
const [searchQuery, setSearchQuery] = useState("");
const { campaigns, loading, searchCampaigns } = useCampaignSearch(authToken);

// Trigger search
useEffect(() => {
  if (searchQuery) {
    searchCampaigns({ q: searchQuery });
  }
}, [searchQuery]);
```

### Advanced Filtering

```typescript
const filters: CampaignSearchFilters = {
  status: ["active", "draft"],
  work_mode: ["remote", "hybrid"],
  min_ctc_from: 10,
  max_ctc_to: 30,
  experience_min_from: 2,
  page: 1,
  page_size: 50,
};

searchCampaigns(filters);
```

### Building Custom Search URLs

```typescript
import { buildCampaignSearchUrl } from "@/types/campaign";

const queryString = buildCampaignSearchUrl({
  q: "python developer",
  status: ["active"],
  work_mode: ["remote"],
  min_ctc_from: 15,
  page: 1,
});

// Result: "q=python+developer&status=active&work_mode=remote&min_ctc_from=15&page=1&page_size=50"
```

## 🔧 Configuration Required

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
NEXT_PUBLIC_TENANT_ID=your-tenant-uuid-here
```

### Authentication

The search API requires:

- `Authorization: Bearer <token>` header
- `tenant-id` header

Make sure your auth token is stored in localStorage:

```typescript
localStorage.getItem("auth-token");
```

## 🎨 UI Components

### Search Input

Located at the top of the Migrations view:

- Real-time search with 300ms debounce
- Search icon indicator
- Placeholder text guides users

### Filter Button

- Shows active filter count badge
- Opens popover with all filter options
- Clear All and Apply buttons

### Campaign Cards

Two variants:

1. **MigrationCard** - Original simple card for non-search views
2. **CampaignSearchCard** - Enhanced card with full campaign details

### Pagination Controls

- Previous/Next buttons
- Disabled when at first/last page
- Shows "Page X of Y (Total: Z campaigns)"

## 📝 Example API Request

The frontend will generate requests like:

```bash
GET /api/campaigns/search?q=python&status=active,draft&work_mode=remote,hybrid&min_ctc_from=15&page=1&page_size=50
Headers:
  Authorization: Bearer <token>
  tenant-id: <uuid>
```

Which the Next.js API route proxies to:

```bash
GET http://localhost:8001/api/v1/campaigns/search?q=python&status=active,draft&work_mode=remote,hybrid&min_ctc_from=15&page=1&page_size=50
Headers:
  Authorization: Bearer <token>
  tenant-id: <uuid>
```

## 🧪 Testing the Integration

### 1. Test Basic Search

1. Navigate to `/campaigns`
2. Click "Migrations" tab
3. Type in the search box
4. Verify campaigns are filtered

### 2. Test Filters

1. Click the "Filters" button
2. Select multiple statuses
3. Set CTC range
4. Click "Apply Filters"
5. Verify results match criteria

### 3. Test Pagination

1. Apply filters that return > 50 results
2. Click "Next" button
3. Verify page 2 loads
4. Click "Previous"
5. Verify page 1 is shown again

### 4. Test Combined Features

1. Enter search term: "developer"
2. Add filters: Status = "active", Work Mode = "remote"
3. Set CTC range: 10-30 LPA
4. Verify results match all criteria
5. Navigate through pages
6. Clear filters and verify reset

## 🐛 Troubleshooting

### Search Returns No Results

- Check if auth token is present
- Verify TENANT_ID is set correctly
- Check browser console for API errors
- Verify backend API is running

### Filters Not Working

- Check if filters are being applied (see browser dev tools network tab)
- Verify filter values are correct format
- Check API documentation for valid values

### Pagination Issues

- Ensure page_size is set (default: 50)
- Verify total_pages calculation
- Check if has_next/has_prev flags are correct

## 🚀 Future Enhancements

Possible improvements:

1. Add sorting UI in the filters
2. Save filter preferences to localStorage
3. Add "Recent Searches" functionality
4. Export search results to CSV
5. Advanced search builder with AND/OR logic
6. Filter presets for common searches
7. URL-based filter sharing
8. Real-time search results count

## 📚 Related Documentation

- Backend API Docs: See `campaign-search-api.md`
- Component Library: Shadcn UI components
- State Management: React hooks (useState, useEffect, useMemo)
- Routing: Next.js App Router

## ✅ Implementation Checklist

- [x] Create Campaign type definitions
- [x] Create API proxy route
- [x] Create useCampaignSearch hook
- [x] Create CampaignFilters component
- [x] Create CampaignSearchCard component
- [x] Integrate search into campaigns page
- [x] Add search input with debouncing
- [x] Add pagination controls
- [x] Handle loading and error states
- [x] Test basic search functionality
- [x] Test advanced filters
- [x] Test pagination
- [x] Document integration

## 📞 Support

For issues or questions:

1. Check browser console for errors
2. Verify API is accessible
3. Check network tab for failed requests
4. Review this documentation
5. Check the API documentation in `campaign-search-api.md`
