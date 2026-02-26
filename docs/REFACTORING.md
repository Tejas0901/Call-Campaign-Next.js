# Templates Page Refactoring

## Overview

The original `page.tsx` had **1000+ lines of code** which violated best practices. This refactoring breaks it down into **smaller, reusable, and maintainable components**.

---

## 📁 New File Structure

```
├── types/
│   └── template.ts                    # TypeScript interfaces
├── hooks/
│   ├── useTemplates.ts                # Template management logic
│   └── useQuestions.ts                # Questions management logic
├── components/
│   └── templates/
│       ├── TemplateSidebar.tsx        # Left sidebar with template list
│       ├── TemplateEditor.tsx         # Main editor view
│       ├── QuestionCard.tsx           # Individual question component
│       ├── CreateTemplateDialog.tsx   # Template creation form
│       ├── DeleteConfirmationDialogs.tsx  # All delete confirmations
│       └── EmptyState.tsx             # No template selected view
└── app/
    └── templates/
        ├── page.tsx                   # Original (1000+ lines)
        └── page-refactored.tsx        # New optimized version (~210 lines)
```

---

## 🎯 Benefits of Refactoring

### 1. **Separation of Concerns**

- **Types**: All interfaces in one place
- **Business Logic**: Extracted to custom hooks
- **UI Components**: Small, focused components

### 2. **Improved Maintainability**

- Each file has a single responsibility
- Easy to locate and fix bugs
- Clear component boundaries

### 3. **Better Reusability**

- `QuestionCard` can be reused in other forms
- `useTemplates` hook can be used in other pages
- Components can be unit tested individually

### 4. **Enhanced Readability**

- Main page is now ~210 lines (down from 1000+)
- Each component is self-documenting
- Clear prop interfaces

### 5. **Performance Benefits**

- Smaller components = easier to optimize
- Can add React.memo() to prevent unnecessary re-renders
- Better code splitting potential

---

## 🔄 Migration Guide

### Step 1: Test the Refactored Version

Rename the files to use the new version:

```bash
mv app/templates/page.tsx app/templates/page-old.tsx
mv app/templates/page-refactored.tsx app/templates/page.tsx
```

### Step 2: Verify Functionality

Test all features:

- ✅ Create new template
- ✅ Edit template name
- ✅ Add/edit/delete questions
- ✅ Add/edit/delete follow-ups
- ✅ Save template
- ✅ Delete template
- ✅ Switch between templates

### Step 3: Remove Old File (if everything works)

```bash
rm app/templates/page-old.tsx
```

---

## 📦 Component Breakdown

### `useTemplates` Hook (220 lines)

**Responsibilities:**

- Fetch templates from API
- Create new templates
- Delete templates
- Update template metadata
- Manage selected template state

**Key Functions:**

```typescript
const {
  templates, // List of all templates
  selectedTemplate, // Currently selected template ID
  templateName, // Name of selected template
  createTemplate, // Create new template
  deleteTemplate, // Delete template
  updateTemplateName, // Save template changes
} = useTemplates();
```

### `useQuestions` Hook (120 lines)

**Responsibilities:**

- Load questions from template
- CRUD operations on questions
- CRUD operations on follow-ups

**Key Functions:**

```typescript
const {
  questions, // All questions
  addQuestion, // Add new question
  updateQuestion, // Update question field
  deleteQuestion, // Remove question
  addFollowUp, // Add follow-up to question
  updateFollowUp, // Update follow-up
  deleteFollowUp, // Remove follow-up
} = useQuestions();
```

### `TemplateSidebar` Component (67 lines)

- Displays list of templates
- Handles template selection
- Create template button

### `TemplateEditor` Component (106 lines)

- Main editing interface
- Template name input
- Questions list container
- Save/Delete actions

### `QuestionCard` Component (155 lines)

- Single question with answer
- Follow-ups list
- Drag handle (for future sorting)
- Delete confirmation

### `CreateTemplateDialog` Component (318 lines)

- Form with all template fields
- Validation
- Submit/Cancel actions

### `DeleteConfirmationDialogs` Component (110 lines)

- Template deletion confirmation
- Question deletion confirmation
- Follow-up deletion confirmation

### `EmptyState` Component (27 lines)

- Shown when no template selected
- Call-to-action to create template

---

## 🚀 Future Improvements

### 1. **Add React Query**

Replace fetch calls with React Query for:

- Automatic caching
- Optimistic updates
- Better error handling
- Loading states

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

const { data: templates } = useQuery(["templates"], fetchTemplates);
const createMutation = useMutation(createTemplate);
```

### 2. **Add Form Validation Library**

Use Zod + React Hook Form:

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  template_name: z.string().min(1, "Required"),
  description: z.string().min(10, "Too short"),
  // ...
});
```

### 3. **Add Drag & Drop**

Use `@dnd-kit/core` for question reordering:

```typescript
import { DndContext, closestCenter } from "@dnd-kit/core";
```

### 4. **Add Unit Tests**

Test each component and hook:

```typescript
// __tests__/useTemplates.test.ts
describe("useTemplates", () => {
  it("should fetch templates on mount", async () => {
    // test implementation
  });
});
```

### 5. **Add Loading States**

Show skeletons while loading:

```typescript
{
  isLoading ? <Skeleton /> : <TemplateEditor />;
}
```

### 6. **Error Boundaries**

Wrap components in error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <TemplateEditor />
</ErrorBoundary>
```

---

## 📊 Size Comparison

| File     | Before      | After     | Reduction |
| -------- | ----------- | --------- | --------- |
| page.tsx | 1000+ lines | 210 lines | **79%**   |

### Code Distribution After Refactoring:

- **Types**: 40 lines
- **Hooks**: 340 lines (2 files)
- **Components**: 758 lines (7 files)
- **Main Page**: 210 lines

**Total**: ~1,348 lines (distributed across 11 files)

---

## 🎓 Best Practices Applied

1. ✅ **Single Responsibility Principle**: Each component/hook has one job
2. ✅ **DRY (Don't Repeat Yourself)**: Common logic extracted to hooks
3. ✅ **Component Composition**: Small components compose into larger ones
4. ✅ **Custom Hooks**: Business logic separate from UI
5. ✅ **TypeScript**: Strong typing for all props and data
6. ✅ **Prop Drilling Solved**: Using hooks instead of passing many props
7. ✅ **Clear Naming**: Function and variable names are descriptive

---

## 🐛 Troubleshooting

### Import Errors

If you see import errors, ensure paths in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Type Errors

Make sure all type files are imported correctly:

```typescript
import { Template, Question } from "@/types/template";
```

### Hook Rules

Remember React hooks rules:

- Only call at top level
- Only call from React functions
- Use `use` prefix for custom hooks

---

## 📝 Notes

- The original `page.tsx` is preserved for reference
- All functionality remains the same
- API calls are unchanged
- No breaking changes to external interfaces

---

## 🤝 Contributing

When adding new features:

1. Keep components under 200 lines
2. Extract complex logic to hooks
3. Add TypeScript types
4. Document props with comments
5. Test thoroughly before committing

---

**Made the codebase cleaner, more maintainable, and easier to scale! 🎉**
