# Campaign Search - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Set Up Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
NEXT_PUBLIC_TENANT_ID=your-tenant-uuid
```

### Step 2: Ensure Authentication

Make sure you're logged in with a valid token stored in `localStorage.getItem("auth-token")`

### Step 3: Use the Search

1. Go to `/campaigns`
2. Click the "Migrations" tab
3. Start searching and filtering!

---

## 📖 Common Use Cases

### Use Case 1: Find Active Remote Developer Positions

```typescript
// Filters to apply:
{
  q: "developer",
  status: ["active"],
  work_mode: ["remote"],
  page: 1
}
```

**How to do it in UI:**

1. Type "developer" in search box
2. Click "Filters" button
3. Select "Active" status badge
4. Select "Remote" work mode badge
5. Click "Apply Filters"

### Use Case 2: Find High-Paying Campaigns

```typescript
// Filters to apply:
{
  min_ctc_from: 20,
  max_ctc_to: 50,
  status: ["active"]
}
```

**How to do it in UI:**

1. Click "Filters" button
2. Enter "20" in Min CTC field
3. Enter "50" in Max CTC field
4. Select "Active" status
5. Click "Apply Filters"

### Use Case 3: Find Walk-in Drive Campaigns

```typescript
// Filters to apply:
{
  is_drive: true,
  drive_date_after: "2026-01-01"
}
```

**How to do it in UI:**

1. Click "Filters" button
2. Set "Walk-in Drive" to "Yes"
3. Set "Drive Date After" to desired date
4. Click "Apply Filters"

---

## 🎯 Filter Options Reference

### Text Search

| Field        | Description   | Example            |
| ------------ | ------------- | ------------------ |
| q            | Global search | "python developer" |
| name         | Campaign name | "hiring drive"     |
| job_role     | Job role      | "developer"        |
| job_location | Location      | "bangalore"        |

### Status Filters (Multi-Select)

- ✅ **Draft** - Campaigns in draft status
- ✅ **Active** - Currently running campaigns
- ✅ **Paused** - Temporarily paused campaigns
- ✅ **Completed** - Finished campaigns

### Work Mode (Multi-Select)

- 🏠 **Remote** - Work from home
- 🏢 **Onsite** - Office-based work
- 🔀 **Hybrid** - Mix of remote and onsite

### Job Type (Multi-Select)

- 📅 **Full Time** - Permanent positions
- 📝 **Contract** - Contract-based roles
- ⏰ **Part Time** - Part-time positions

### Range Filters

| Filter          | Description         | Format             |
| --------------- | ------------------- | ------------------ |
| CTC Range       | Salary in LPA       | Min: 10, Max: 30   |
| Experience      | Years of experience | Min: 2, Max: 5     |
| Total Contacts  | Number of contacts  | Min: 100, Max: 500 |
| Completed Calls | Finished calls      | Min: 50, Max: 200  |

### Date Filters

| Filter       | Description               | Format     |
| ------------ | ------------------------- | ---------- |
| Created Date | When campaign was created | YYYY-MM-DD |
| Started Date | When campaign started     | YYYY-MM-DD |
| Drive Date   | Walk-in drive date        | YYYY-MM-DD |

---

## 🔍 Search Tips

### Best Practices

1. **Start Broad, Then Narrow**: Begin with a simple search, then add filters
2. **Use Multiple Filters**: Combine status, work mode, and CTC for precise results
3. **Check Total Results**: Look at the pagination info to see how many match
4. **Clear Filters**: Use "Clear All" to start fresh

### Search Behavior

- Search is **case-insensitive** (Python = python = PYTHON)
- Search is **partial match** ("dev" matches "developer")
- Multiple filters use **AND logic** (all must match)
- Multi-select badges use **OR logic** (any can match)

### Performance Tips

- Search has 300ms debounce (automatic)
- Results are paginated (50 per page default)
- Filters are cached during session
- API responses are fast (<500ms typical)

---

## 📊 Understanding Results

### Campaign Card Shows:

- **Campaign Name** - Primary identifier
- **Job Role** - Position title
- **Company** - Hiring organization
- **Location** - Job location
- **CTC Range** - Salary range in LPA
- **Experience** - Required years
- **Contacts** - Total candidates
- **Status Badge** - Current state
- **Work Mode Badge** - Remote/Onsite/Hybrid
- **Job Type Badge** - Full Time/Contract/Part Time

### Pagination Info Shows:

```
Showing page 2 of 10 (Total: 487 campaigns)
[Previous] [Next]
```

---

## ⚡ Keyboard Shortcuts (Future)

_Coming soon:_

- `Ctrl + K` - Focus search box
- `Ctrl + F` - Open filters
- `Enter` - Apply filters
- `Esc` - Close filters

---

## 🐛 Common Issues & Solutions

### Issue: No Results Found

**Solutions:**

1. Check if filters are too restrictive
2. Try clearing all filters
3. Use broader search terms
4. Verify campaigns exist in database

### Issue: Search Not Working

**Solutions:**

1. Check console for errors
2. Verify auth token exists
3. Check TENANT_ID is set
4. Ensure backend API is running

### Issue: Slow Performance

**Solutions:**

1. Search is already debounced (300ms)
2. Reduce page_size if needed
3. Use more specific filters
4. Check network connection

---

## 🎓 Advanced Usage

### Programmatic Search

```typescript
import { useCampaignSearch } from "@/hooks/useCampaignSearch";

function MyComponent() {
  const { campaigns, searchCampaigns, pagination } = useCampaignSearch(token);

  // Search on mount
  useEffect(() => {
    searchCampaigns({
      status: ["active"],
      work_mode: ["remote"],
      page: 1,
    });
  }, []);

  return <div>Found {pagination?.total} campaigns</div>;
}
```

### Building Custom Filters

```typescript
import { buildCampaignSearchUrl } from "@/types/campaign";

const url = buildCampaignSearchUrl({
  q: "python",
  status: ["active", "draft"],
  min_ctc_from: 15,
  max_ctc_to: 30,
  work_mode: ["remote"],
  page: 1,
  page_size: 25,
});
// Use with fetch or axios
```

---

## 📞 Need Help?

1. Check the full documentation: `CAMPAIGN_SEARCH_INTEGRATION.md`
2. Review API docs: `campaign-search-api.md`
3. Check browser console for errors
4. Verify environment variables
5. Test with simple searches first

---

**Happy Searching! 🎉**
