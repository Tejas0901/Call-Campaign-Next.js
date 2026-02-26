# Authentication Integration Setup Checklist

## ✅ Implementation Complete

The following files have been created and are ready to use:

### Core Auth Files
- ✅ `lib/authService.ts` - Authentication API service
- ✅ `lib/tokenStorage.ts` - Token/user storage management
- ✅ `lib/apiClient.ts` - HTTP client with auto-refresh
- ✅ `lib/errorMessages.ts` - Error handling utilities
- ✅ `context/auth-context.tsx` - Auth provider & hooks
- ✅ `components/auth/RoleGate.tsx` - Role-based UI rendering
- ✅ `components/auth/ProtectedRoute.tsx` - Route protection
- ✅ `hooks/useApiCall.ts` - API call hook
- ✅ `app/auth/login/page.tsx` - Updated login page
- ✅ `app/settings/users/page.tsx` - User management page

### Configuration
- ✅ `.env.local` - Updated with API base URL

---

## 📋 Setup Steps

### Step 1: Wrap App in AuthProvider
**File:** `app/layout.tsx`

```typescript
import { AuthProvider } from '@/context/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 2: Update API Base URL (if needed)
**File:** `.env.local`

```env
# Update this to match your backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

### Step 3: Verify Auth API Endpoints
Check that your backend has these endpoints:
- ✅ `POST /api/v1/auth/login`
- ✅ `POST /api/v1/auth/logout`
- ✅ `POST /api/v1/auth/refresh`
- ✅ `GET /api/v1/auth/me`
- ✅ `PATCH /api/v1/auth/me`
- ✅ `POST /api/v1/auth/change-password`
- ✅ `GET /api/v1/auth/users`
- ✅ `POST /api/v1/auth/users`
- ✅ `PATCH /api/v1/auth/users/{id}`
- ✅ `DELETE /api/v1/auth/users/{id}`

### Step 4: Add Protected Routes (Optional)
**File:** `app/layout.tsx` or `middleware.ts`

```typescript
// Example: Protect admin routes
import { RequireRole } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/context/auth-context';

<RequireRole requiredRole={ROLES.ADMIN}>
  <AdminPanel />
</RequireRole>
```

### Step 5: Update Pages to Use New Auth
Replace old authentication code with new hooks:

```typescript
// Old way
const { user, login } = useAuth();

// New way
const { user, login, hasRole, isRole } = useAuth();
const { hasRole, isRole, isAdmin } = useRole();
```

### Step 6: Test Authentication Flow

**Test 1: Login**
```
1. Go to http://localhost:3000/auth/login
2. Enter test credentials
3. Should redirect to /dashboard (or based on role)
4. Check localStorage for tokens
```

**Test 2: Token Refresh**
```
1. Login successfully
2. Wait for access token to expire (or simulate)
3. Make an API request
4. Should automatically refresh token
5. Request should succeed
```

**Test 3: Role-Based Access**
```
1. Login with different roles
2. Check if RoleGate components show/hide
3. Verify RequireRole blocks unauthorized access
```

---

## 🔧 Configuration Reference

### Environment Variables
```env
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001

# Optional - Existing configs
NEXT_PUBLIC_HYREX_API_BASE_URL=https://api-v2.hyrexai.com/api/v1
NEXT_PUBLIC_TENANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### Role Constants
```typescript
import { ROLES } from '@/context/auth-context';

ROLES.SUPERADMIN  // 'superadmin' - Full access
ROLES.ADMIN       // 'admin' - User & campaign management
ROLES.RECRUITER   // 'recruiter' - Campaign operations
ROLES.VIEWER      // 'viewer' - Read-only access
```

---

## 📚 Usage Examples

### Login Page
```typescript
import { useAuth } from '@/context/auth-context';

const { login, error, loading } = useAuth();

const handleLogin = async (email, password) => {
  try {
    await login(email, password);
    // Auto-redirected by the page
  } catch (err) {
    // Error displayed in auth context
  }
};
```

### Check User Role
```typescript
import { useRole } from '@/context/auth-context';

const { isAdmin, hasRole, isSuperAdmin } = useRole();

if (isAdmin) {
  // Show admin features
}

if (hasRole('recruiter')) {
  // Show recruiter or higher features
}
```

### Conditional UI
```typescript
import { RoleGate, ExactRole } from '@/components/auth/RoleGate';
import { ROLES } from '@/context/auth-context';

<RoleGate role={ROLES.ADMIN}>
  <button>Delete User</button>
</RoleGate>

<ExactRole role={ROLES.SUPERADMIN}>
  <button>Manage Tenants</button>
</ExactRole>
```

### API Calls with Auto-Refresh
```typescript
import apiClient from '@/lib/apiClient';

// Automatically includes Bearer token
const data = await apiClient.get('/api/v1/campaigns');

// Auto-refreshes token on 401
const result = await apiClient.post('/api/v1/campaigns', payload);
```

### User Management
```typescript
import authService from '@/lib/authService';
import { useAuth } from '@/context/auth-context';

const { getAccessToken } = useAuth();
const token = getAccessToken();

// List users
const { users } = await authService.listUsers(token);

// Create user
const newUser = await authService.createUser(token, {
  email: 'user@example.com',
  username: 'username',
  password: 'password123',
  role: 'recruiter',
});

// Deactivate user
await authService.deactivateUser(token, userId);
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "useAuth is undefined" | Wrap app in `<AuthProvider>` in layout.tsx |
| Tokens not saving | Check localStorage permissions and browser settings |
| 401 errors not auto-refreshing | Verify backend returns proper 401 status |
| User state not persisting | Check that tokenStorage.getUser() works |
| Role gates not updating | Use useRole() hook properly, not direct user.role |

---

## 🚀 Next Steps

1. **✅ Done:** Core auth system implemented
2. **→ Next:** Wrap app in AuthProvider in layout.tsx
3. **→ Next:** Test login with your backend
4. **→ Next:** Add role-protected routes
5. **→ Next:** Update existing pages to use new auth
6. **→ Next:** Deploy to production with security hardening

---

## 📞 Quick Reference

**Main Imports**
```typescript
import { useAuth, useRole, ROLES } from '@/context/auth-context';
import { RoleGate, ExactRole } from '@/components/auth/RoleGate';
import { RequireAuth, RequireRole } from '@/components/auth/ProtectedRoute';
import authService from '@/lib/authService';
import apiClient from '@/lib/apiClient';
import { useApiCall } from '@/hooks/useApiCall';
```

**Hook Returns**
```typescript
// useAuth()
{ user, login, logout, refresh, hasRole, isRole, isLoggedIn, getAccessToken, error, loading }

// useRole()
{ role, hasRole, isRole, isSuperAdmin, isAdmin, isRecruiter, isViewer }

// useApiCall()
{ call, loading, error, clearError }
```

---

## ✨ Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Token storage | ✅ | `lib/tokenStorage.ts` |
| API service | ✅ | `lib/authService.ts` |
| Auth context | ✅ | `context/auth-context.tsx` |
| Role-based UI | ✅ | `components/auth/RoleGate.tsx` |
| Protected routes | ✅ | `components/auth/ProtectedRoute.tsx` |
| Login page | ✅ | `app/auth/login/page.tsx` |
| User management | ✅ | `app/settings/users/page.tsx` |
| Auto token refresh | ✅ | `lib/apiClient.ts` |
| Error handling | ✅ | `lib/errorMessages.ts` |
| API call hook | ✅ | `hooks/useApiCall.ts` |

---

**Ready to go! 🎉 All authentication features are implemented and ready for integration with your backend.**
