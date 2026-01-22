# Location Multi-Select Component Implementation

## Overview

Added a reusable location dropdown component with Indian cities and states, integrated into the CreateCampaignModal.

## Files Created

### 1. `/data/indianCities.ts`

- Contains a comprehensive list of 100+ Indian cities with their corresponding states
- Includes major cities from all 28 states and 8 union territories
- Each city has:
  - `label`: Display name with state (e.g., "Bangalore, Karnataka")
  - `value`: Unique identifier for data storage
  - `state`: State/UT name for filtering and display

### 2. `/components/LocationMultiSelect.tsx`

- Reusable component for multi-select location picker
- Features:
  - Real-time search filtering by city name or state
  - Dropdown suggestions with city and state information
  - Maximum locations limit (configurable, default: 10)
  - Selected locations displayed as removable tags
  - "Add" button to add city from search
  - Keyboard and click support
  - Fully styled with Tailwind CSS

### Component Props

```typescript
interface LocationMultiSelectProps {
  value: string[]; // Array of selected city values
  onChange: (locations: string[]) => void; // Callback when selection changes
  label?: string; // Label text (default: "Locations")
  placeholder?: string; // Input placeholder
  maxLocations?: number; // Max selectable locations (default: 10)
}
```

## Integration Points

### CreateCampaignModal Updates

1. **Import Added**:

   ```tsx
   import { LocationMultiSelect } from "@/components/LocationMultiSelect";
   ```

2. **Primary Location** - Now uses LocationMultiSelect with maxLocations=1

   ```tsx
   <LocationMultiSelect
     value={location ? [location] : []}
     onChange={(locs) => setLocation(locs[0] || "")}
     label=""
     placeholder="Search and select primary city..."
     maxLocations={1}
   />
   ```

3. **Multiple Locations** - Uses LocationMultiSelect with maxLocations=10
   ```tsx
   <LocationMultiSelect
     value={multipleLocations}
     onChange={setMultipleLocations}
     label=""
     placeholder="Search and select Indian cities..."
     maxLocations={10}
   />
   ```

## Features

✅ **Search & Filter**: Type to search cities by name or state
✅ **Dropdown Suggestions**: Shows matching cities with state info
✅ **Multi-Select**: Select up to 10 locations (configurable)
✅ **Visual Feedback**:

- Selected items shown as tags
- "Selected" indicator in dropdown
- Max limit message
  ✅ **Data Storage**:
- Values stored as array of city IDs
- Can be easily converted to display names using indianCities data
  ✅ **Keyboard Support**: Enter key to add, remove with button click
  ✅ **Responsive**: Works on mobile and desktop

## Data Format

When locations are selected, they're stored as an array of city values:

```typescript
// Example selected locations
["bangalore", "pune", "hyderabad"][
  // Which map to:
  ("Bangalore, Karnataka", "Pune, Maharashtra", "Hyderabad, Andhra Pradesh")
];
```

## Usage in Other Components

To use this component in other parts of the app:

```tsx
import { LocationMultiSelect } from "@/components/LocationMultiSelect";

const [locations, setLocations] = useState<string[]>([]);

return (
  <LocationMultiSelect
    value={locations}
    onChange={setLocations}
    label="Job Locations"
    placeholder="Select cities..."
    maxLocations={5}
  />
);
```

## Backward Compatibility

The existing `multipleLocations` state and display logic remain unchanged. The component simply replaces the UI for selecting locations while maintaining the same data structure.
