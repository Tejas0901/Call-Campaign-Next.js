# Ngrok "Failed to Fetch" Error - Troubleshooting Guide

## Issue
```
TypeError: Failed to fetch
```

## Root Causes & Solutions

### 1. **Missing Ngrok Headers** ✅ FIXED
Ngrok requires specific headers to bypass browser warnings.

**What we fixed:**
- Added `ngrok-skip-browser-warning: '69420'` header to all auth API calls
- Updated both `authService.ts` and `apiClient.ts`

**Files updated:**
- `lib/authService.ts` - Added `getDefaultHeaders()` function
- `lib/apiClient.ts` - Added `getDefaultHeaders()` function

### 2. **CORS Issues**
Ngrok tunnels may have CORS restrictions.

**Check in browser DevTools:**
1. Open **DevTools → Network tab**
2. Look for the login request
3. Check the **Response headers** for:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: POST, GET, OPTIONS, etc.
   ```

If missing, your backend needs to enable CORS.

### 3. **Ngrok URL Timeout**
The ngrok tunnel may be inactive or URL changed.

**Verify the URL:**
```bash
# Test the endpoint directly
curl -X POST https://celsa-heptavalent-pseudohistorically.ngrok-free.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: 69420" \
  -d '{"email":"test@example.com","password":"password"}'
```

**If it fails:**
1. Your ngrok tunnel may have expired
2. Backend service is not running
3. Ngrok URL changed - update `.env.local`

### 4. **Content-Type Header Missing**
Ensure `Content-Type: application/json` is sent.

**Status:** ✅ Fixed in both `authService.ts` and `apiClient.ts`

### 5. **Network Policy/Firewall**
Some corporate networks block ngrok tunnels.

**Test:**
- Try from a different network
- Check if ngrok is in whitelist/firewall rules

---

## Quick Debugging Steps

### Step 1: Check Browser Console
```javascript
// Open DevTools → Console → Paste this:
fetch('https://celsa-heptavalent-pseudohistorically.ngrok-free.dev/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  },
  body: JSON.stringify({ email: 'test@example.com', password: 'password' })
})
  .then(r => r.json())
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e))
```

### Step 2: Check Network Tab
1. Open DevTools → Network
2. Try login again
3. Look for the login request
4. Check **Status**, **Headers**, **Response**

### Step 3: Verify .env.local
```env
NEXT_PUBLIC_API_BASE_URL=https://celsa-heptavalent-pseudohistorically.ngrok-free.dev
```

### Step 4: Restart Dev Server
```bash
# Stop with Ctrl+C
npm run dev
```

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch` | CORS, timeout, or unreachable | Check backend, CORS headers, ngrok URL |
| `401 Unauthorized` | Invalid credentials | Verify backend user exists |
| `422 Unprocessable Entity` | Invalid request format | Check JSON body format |
| `500 Server Error` | Backend error | Check backend logs |
| `Network timeout` | Slow/unreachable backend | Check ngrok tunnel is active |

---

## Verify Auth System is Working

Once fetch errors are resolved:

1. **Login Page Loads:**
   ```
   http://localhost:3000/auth/login
   ```

2. **DevTools → Application → Local Storage:**
   Should see after successful login:
   - `callbot_access_token`
   - `callbot_refresh_token`
   - `callbot_user`

3. **Automatic Redirect:**
   Should redirect to `/dashboard` or based on user role

4. **Auto Token Refresh:**
   Should work when token expires (401 → refresh → retry)

---

## Files Modified

✅ **lib/authService.ts**
- Added `getDefaultHeaders()` helper
- Updated login to use ngrok headers
- Updated refreshToken to use ngrok headers

✅ **lib/apiClient.ts**
- Added `getDefaultHeaders()` helper
- Updated request method to include default headers
- Updated token refresh to use ngrok headers

---

## Next Steps if Still Failing

1. **Check backend logs** - See what errors backend is reporting
2. **Verify CORS is enabled** - Backend should allow cross-origin requests
3. **Test ngrok URL manually** - Use curl or Postman
4. **Check ngrok status** - Ensure tunnel is active: `https://dashboard.ngrok.com`
5. **Use ngrok headers** - All requests must include `ngrok-skip-browser-warning` header

---

## Backend CORS Configuration (if needed)

Your backend should have CORS enabled:

```python
# FastAPI Example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```javascript
// Express Example
const cors = require('cors');
app.use(cors());
```

---

**Issue should now be resolved! Try logging in again.** ✅
