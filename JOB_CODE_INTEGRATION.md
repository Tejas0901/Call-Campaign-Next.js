# Job Code API Integration

## Overview

This document describes the integration of the Hyrex Job Code API into the Call Campaign frontend application.

## API Endpoint

- **Base URL**: `https://api.hyrexai.com/api/v1`
- **Jobs Endpoint**: `/jobs/jobview/`

### Available Filters

- `job_code` - Filter by specific job code (e.g., `A-00401`)
- `status` - Filter by job status (default: `all`)
- `job_created_start` - Start date for job creation filter
- `job_created_end` - End date for job creation filter
- `page` - Pagination page number
- `size` - Number of results per page (default: 20, max: 100)

### API Response Structure

```json
{
  "count": 370,
  "next": "http://api.hyrexai.com/api/v1/jobs/jobview/?page=2&size=100",
  "previous": null,
  "results": [
    {
      "id": 464,
      "job_code": "A-00401",
      "title": "Lead UX Designer",
      "client_name": "Cognizant",
      "description": "...",
      "location": "Hyderabad",
      "job_type": "full time",
      "remote": "yes",
      "vertical_name": "IOT",
      "job_status": "1",
      "primary_skills": [...],
      "secondary_skills": [...]
    }
  ]
}
```

## Implementation Files

### 1. **Hook: useJobCodes** (`hooks/useJobCodes.ts`)

Custom React hook for managing job codes data fetching and searching.

**Features:**

- Fetches all job codes from the API
- Caches job codes in component state
- Provides search functionality
- Handles error states and loading states

**Usage:**

```typescript
const { jobs, loading, error, fetchJobCodes, fetchJobByCode, searchJobs } =
  useJobCodes();

// Fetch all job codes
await fetchJobCodes();

// Fetch specific job by code
const job = await fetchJobByCode("A-00401");

// Search jobs locally
const results = searchJobs("UX Designer");
```

### 2. **Component: Combobox** (`components/ui/combobox.tsx`)

Reusable combobox/dropdown component for selecting job codes.

**Features:**

- Searchable dropdown
- Keyboard navigation support
- Loading state
- Custom placeholders and messages
- Accessible (A11y compliant)

**Props:**

```typescript
interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  disabled?: boolean;
  loading?: boolean;
}
```

### 3. **API Integration Module** (`lib/api-integrations.ts`)

Centralized API integration module with helper functions.

**Functions:**

- `fetchJobsFromHyrex(page, size)` - Fetch all jobs
- `filterJobsByCode(jobCode)` - Filter jobs by code
- `searchJobs(filters)` - Advanced search with multiple filters

### 4. **Create Campaign Modal** (`components/CreateCampaignModal.tsx`)

Updated to include job code selector with auto-population of fields.

**Changes:**

- Replaced text input with Combobox component
- Auto-loads job codes when modal opens
- Auto-populates job role, company name, and location when a job code is selected
- Preserves user input if they've already filled fields

## How It Works

### Flow Diagram

```
User Opens Campaign Modal
         ↓
useJobCodes hook fetches jobs from API
         ↓
Jobs displayed in Combobox dropdown
         ↓
User selects a job code
         ↓
Auto-populate:
  - Job Role (title)
  - Company Name (client_name)
  - Location (location)
         ↓
User can modify auto-filled fields
         ↓
Submit campaign
```

### Key Features

1. **Lazy Loading**: Job codes are fetched only when the modal opens
2. **Smart Auto-fill**: Only fills empty fields, preserves user input
3. **Searchable**: Users can search by job code, title, or company name
4. **Error Handling**: Gracefully handles API failures with fallback UI
5. **Loading States**: Shows loading indicator while fetching data

## Usage in Campaign Creation

### Step-by-Step:

1. Click "Create Campaign" button
2. Job codes are automatically fetched in the background
3. Click on the Job Code field to open the dropdown
4. Search or scroll to find desired job code
5. Select a job code
6. The form auto-fills:
   - Job Role: From job title
   - Company Name: From client name
   - Location: From job location
7. Review and modify auto-filled fields if needed
8. Fill in remaining required fields (experience, CTC, etc.)
9. Click "Create Campaign"

## Error Handling

The integration includes error handling for:

- Network failures
- API timeouts
- Invalid responses
- Empty results

All errors are logged to console and a user-friendly message is shown in the UI.

## Performance Considerations

1. **Caching**: Job codes are cached in component state to avoid repeated API calls
2. **Pagination**: API supports pagination for large datasets (currently fetches 100 items)
3. **Local Search**: Search filtering happens locally to avoid additional API calls
4. **Debouncing**: Consider adding debouncing for search in future updates

## Future Enhancements

1. Implement pagination for job lists
2. Add filters for job status, location, skills
3. Add infinite scroll for large datasets
4. Cache job data locally for offline access
5. Add more job details display (skills, requirements, etc.)
6. Multi-select job codes support

## Testing

To test the integration:

1. **Test Job Code Selection**:

   - Open Create Campaign modal
   - Click Job Code field
   - Verify dropdown loads with jobs
   - Select a job code
   - Verify auto-fill works

2. **Test Error Handling**:

   - Disconnect network
   - Try to fetch jobs
   - Verify error message shows

3. **Test Search**:
   - Type in job code field
   - Verify filtering by code, title, company

## API Rate Limiting

The Hyrex API may have rate limiting. Monitor usage and consider implementing:

- Request throttling
- Caching strategies
- Batch requests

## Support

For issues with the Hyrex API, contact:

- API Documentation: https://api.hyrexai.com/
- Support: [Check Hyrex documentation]
