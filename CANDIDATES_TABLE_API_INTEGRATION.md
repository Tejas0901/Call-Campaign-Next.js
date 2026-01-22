# Candidates Table API Integration Update

## Overview

Updated the campaign migrations detail page to fetch real candidate data from the API instead of showing static data. The table now displays contacts imported for the campaign.

## Changes Made

### 1. **Migration Detail Page** - `/app/campaigns/migrations/[id]/page.tsx`

#### State Management

- Replaced static candidate array with empty initial state
- Added loading state: `candidatesLoading`
- Added error state: `candidatesError`

#### API Integration

- Added new `useEffect` hook to fetch contacts from `/api/v1/contacts/{campaignId}`
- Fetches only when `authToken` and `campaignId` are available
- Handles API errors gracefully with user-friendly error messages

#### Data Transformation

Converts API response format to CandidateRow format:

```typescript
// API Response
{
  "id": "491ab2d1-082c-482d-9822-414ea9dc0c4b",
  "candidate_name": "Test User",
  "phone_number": "9876543210",
  "email": null,
  "ats_candidate_id": "330a253e-c45e-407d-a1b0-00d48160341c",
  "resume_url": null,
  ...
}

// Transformed to CandidateRow
{
  id: "491ab2d1-082c-482d-9822-414ea9dc0c4b",
  name: "Test User",
  phone: "9876543210",
  email: "—",
  resume: null,
  resumeFileName: null,
  candidateId: "330a253e-c45e-407d-a1b0-00d48160341c"
}
```

#### UI Updates

- Show spinner while loading
- Display error message if fetch fails
- Show candidate count in header
- Display "Imported candidate data" instead of "Uploaded candidate data"

### 2. **Candidates Table Component** - `/components/ui/candidates-table.tsx`

#### Updated Interface

Made `role` and `company` fields optional, added `candidateId` field:

```typescript
export interface CandidateRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  resume?: File | null;
  resumeFileName?: string;
  role?: string; // Optional now
  company?: string; // Optional now
  candidateId?: string; // New field
}
```

#### Table Columns (Updated)

Changed from: `Checkbox | Name | Phone | Email | Resume | Role | Company`
Changed to: `Checkbox | Name | Candidate ID | Phone | Email | Resume`

#### Removed Columns

- **Role** - Not provided by the API
- **Company** - Not provided by the API

#### Added Columns

- **Candidate ID** - Displays ATS candidate ID with tooltip, or falls back to contact ID
- Uses monospace font for UUID display
- Truncated with max-width and full ID visible on hover

## API Endpoint Details

**Endpoint**: `/api/v1/contacts/{campaign_id}`  
**Method**: GET  
**Headers**:

- `Authorization`: Bearer `{authToken}`
- `tenant-id`: `{TENANT_ID}`
- `Content-Type`: application/json

**Response Format**:

```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "string (UUID)",
        "candidate_name": "string",
        "phone_number": "string",
        "email": "string or null",
        "ats_candidate_id": "string or null",
        "resume_url": "string or null",
        ...
      }
    ],
    "count": number,
    "total": number
  }
}
```

## Features

✅ **Real-time Data** - Fetches from API on page load  
✅ **Error Handling** - Displays error message if fetch fails  
✅ **Loading State** - Shows spinner while fetching  
✅ **Candidate ID Display** - Shows ATS candidate ID with tooltip  
✅ **Resume Support** - Shows resume URL if available  
✅ **Empty State** - Shows "No candidates added yet" when empty

## Removed

- All static candidate mock data (10 hardcoded candidates)

## Backward Compatibility

- Resume upload functionality remains intact
- Selection functionality remains intact
- Can still be used with manually added data via `onDataChange`

## Console Logging

Includes debug logs prefixed with `[MigrationDetailPage]` for debugging:

- Token availability check
- API request details
- API response
- Data transformation steps
- Error messages
