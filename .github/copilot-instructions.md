# Copilot Instructions for Call Campaign Next.js

## Project Overview

A modern SaaS dashboard built with **Next.js 16**, **React 19**, **TypeScript**, and **Shadcn UI** components. The app manages recruitment campaigns by integrating with the **Hyrex Job Code API** and provides features for campaign creation, job selection, templates, and analytics.

## Architecture & Key Patterns

### Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Styling**: Tailwind CSS v4.1, Shadcn UI (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **External API**: Hyrex Job Code API (`https://api.hyrexai.com/api/v1`)
- **Auth**: Custom token-based (localStorage `auth-token`)
- **Charts**: Recharts for analytics

### Directory Structure

- **`app/`** - Next.js App Router pages (auth, dashboard, campaigns, jobs, templates, etc.)
- **`components/`** - Reusable UI components (organized by domain: ui/, jobs/, templates/, layouts/)
- **`hooks/`** - Custom hooks (`useJobCodes`, `useTemplates`, `useQuestions`, `useToast`, `useMobile`)
- **`lib/`** - Utilities and API integrations (`api-integrations.ts`, `utils.ts`)
- **`context/`** - React Context for global state (auth management)
- **`types/`** - TypeScript interfaces (`job-code.ts`, `template.ts`)

### Authentication Flow

1. Token stored in `localStorage.setItem('auth-token', token)` after login
2. **Middleware** (`middleware.ts`) protects routes - redirects unauthenticated users from protected paths to `/auth/login`
3. **AuthContext** (`context/auth-context.tsx`) provides `user`, `login()`, `logout()`, `signup()`, `loading` state
4. Token passed to child components via props or context
5. API calls include token in `Authorization: Bearer <token>` header

**Critical**: Always pass `authToken` to `useJobCodes()` hook and check for it before API calls. Token may be undefined on initial render.

### Hyrex Job Code API Integration

**Files**: `hooks/useJobCodes.ts`, `lib/api-integrations.ts`, `types/job-code.ts`

**Key Functions**:

- `fetchJobsFromHyrex(page, size, authToken)` - Fetch paginated jobs from Hyrex
- `filterJobsByCode(jobCode, authToken)` - Fetch specific job by code
- `buildHeaders(authToken, format)` - Constructs Authorization header with format (Bearer or Token)

**Response Structure**:

```typescript
interface JobsListResponse {
  count: number;
  results: JobData[];
  next?: string;
  previous?: string;
}
```

**Important**: The API supports dual auth formats (Bearer/Token). The app auto-detects via 401 retry and caches preference in `localStorage.hyrex-auth-format`.

### Component Patterns

#### UI Components (Shadcn)

Located in `components/ui/`. All are headless, styled with Tailwind. Examples:

- `Combobox` - Searchable dropdown with filtering on both `value` and `label`
- `Button`, `Input`, `Select`, `Dialog`, etc.

**Usage**: Import and compose within domain components. Props are standardized across Shadcn components.

#### Domain Components

Organized by feature (jobs, templates, campaigns). Example:

- `components/templates/TemplateEditor.tsx` - Main editor UI
- `components/templates/QuestionCard.tsx` - Reusable card for questions
- `components/CreateCampaignModal.tsx` - Campaign creation form

**Pattern**: Separate UI from business logic. Use custom hooks for state/API calls, pass data as props to components.

#### Hooks Pattern

Custom hooks extract reusable logic (data fetching, form state, filtering). Example:

```typescript
const { jobs, loading, error, fetchJobCodes, searchJobs } =
  useJobCodes(authToken);
```

Return objects with `loading`, `error`, and callback functions. Always handle undefined authToken gracefully.

### Form Handling

Uses **React Hook Form** + **Zod** for validation:

- `useForm()` hook for form state
- `zodResolver()` for validation
- `<Form>` component wrapper from `components/ui/form.tsx`

Example pattern:

```typescript
const form = useForm<FormData>({ resolver: zodResolver(schema) });
const onSubmit = form.handleSubmit(async (data) => {
  /* API call */
});
```

### State Management

- **Local state** - `useState` for component-level UI state
- **Context** - `AuthContext` for global auth state
- **Hook state** - Custom hooks cache API responses (e.g., jobs list in `useJobCodes`)

**No Redux/Zustand** - Keep it simple with React's built-in mechanisms.

## Critical Developer Workflows

### Running the App

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
```

### Debugging Hyrex Token Flow

Use **DEBUG_CHECKLIST.md** - contains console log markers to trace token flow:

1. Login token stored in DevTools → Application → Local Storage
2. Modal receives token via props
3. Hook initializes with token (check console)
4. Fetch initiated with Authorization header
5. API response validates success (200 vs 401)

**Console markers**: `[Login Response]`, `[CreateCampaignModal]`, `[useJobCodes]`, `[fetchJobsFromHyrex]`

### Adding New Features

1. **Define types** in `types/` (use existing Job/Template interfaces as models)
2. **Create custom hook** in `hooks/` if data fetching needed
3. **Build UI components** in `components/` (compose from Shadcn)
4. **Integrate in page** under `app/[feature]/`
5. **Protect routes** via `middleware.ts` (add to `protectedRoutes` if needed)

## Project-Specific Conventions

### Naming Conventions

- Files: PascalCase for components (e.g., `CreateCampaignModal.tsx`), kebab-case for utilities
- Components: React components are default exports
- Hooks: Named exports, prefixed with `use` (e.g., `useJobCodes`)
- Types: PascalCase interfaces exported from `types/` folder

### Console Logging Pattern

Uses prefixed console logs for debugging (e.g., `[useJobCodes]`, `[fetchJobsFromHyrex]`). Preserve these logs for production debugging - they're searchable.

### Error Handling

- Custom hooks return `error` state (string or null)
- Components show `error` via toast notifications (`useToast()`)
- Failed API calls log error message (truncated to 300 chars)
- Auth errors trigger redirect to `/auth/login`

### TypeScript Strictness

- `strict: true` in `tsconfig.json`
- `ignoreBuildErrors: false` - all types must be valid
- Import explicit types from files (avoid `any` where possible)

## Integration Points & Dependencies

### External APIs

- **Hyrex Job API** (`api-integrations.ts`) - Auth token required, supports Bearer/Token formats
- **Vercel Analytics** - Auto-imported in root layout

### API Routes

- `/api/auth/login` - POST (email, password)
- `/api/auth/signup` - POST (name, email, password)
- `/api/auth/me` - GET (validate token)
- `/api/jobs/*`, `/api/candidates/*`, `/api/templates/*`, `/api/hyrex/*` - Domain-specific routes

**Pattern**: API routes act as backend proxies. Call them from client, not external APIs directly (except Hyrex which is called client-side).

### Build & Deployment

- **Next.js config** (`next.config.mjs`) - Ignores TS build errors (intentional for v0 project), unoptimized images
- **Environment variables** - `NEXT_PUBLIC_HYREX_API_BASE_URL` (public, used in browser)
- **Middleware** runs on server; checks auth tokens before rendering protected pages

## Key Files Reference

- **Auth**: `context/auth-context.tsx`, `middleware.ts`
- **API**: `lib/api-integrations.ts`, `app/api/auth/*`
- **Jobs**: `hooks/useJobCodes.ts`, `types/job-code.ts`
- **UI**: `components/ui/` (Shadcn), `components/layouts/MainLayout.tsx`
- **Forms**: `components/templates/TemplateEditor.tsx` (example of React Hook Form + Zod)
- **Debugging**: `DEBUG_CHECKLIST.md`, `JOB_CODE_INTEGRATION.md`

## Common Gotchas

1. **Auth token timing** - Token may be `undefined` on SSR. Always check `if (authToken)` before using.
2. **Middleware token access** - Can't read `localStorage` in middleware (server-side). Check cookies or headers.
3. **API format mismatch** - Hyrex API accepts both `Bearer` and `Token` auth. App auto-detects, but check `hyrex-auth-format` in localStorage if auth fails.
4. **Build errors ignored** - `next.config.mjs` has `ignoreBuildErrors: true`. Fix TypeScript warnings proactively.
5. **Component reuse** - Shadcn components are copy-pasted from shadcn/ui. Updates must be manually pulled (not npm-managed).
