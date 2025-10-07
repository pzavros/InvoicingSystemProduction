# Environment Variables Test

## Summary of Changes Made

### 1. **Webpage (.env file created)**
```
VITE_API_BASE_URL=http://localhost:5062
VITE_ADMIN_API_ENDPOINT=http://localhost:5062/api/admin
VITE_REGULAR_API_ENDPOINT=http://localhost:5062/api
VITE_APP_NAME=Invoice System Admin
VITE_APP_VERSION=1.0.0
```

### 2. **Frontend (.env file updated)**
```
VITE_APP_API_BASE_URL=http://localhost:5062
VITE_ADMIN_API_ENDPOINT=http://localhost:5062/api/admin
VITE_REGULAR_API_ENDPOINT=http://localhost:5062/api
```

### 3. **Backend (launchSettings.json updated)**
- Changed all ports from 5000 to 5062

### 4. **Webpage API Integration**
- Created centralized `apiConfig.js` utility
- Updated `AdminAuthContext` to use centralized API calls
- Updated `SimpleWaitlistDashboard` to use API config
- Updated `ContactMessagesDashboard` to use API config

## Files Created/Modified:

### New Files:
- `/Webpage/.env` - Environment variables for webpage
- `/Webpage/src/utils/apiConfig.js` - Centralized API configuration

### Modified Files:
- `/Frontend/.env` - Updated API base URL to port 5062
- `/Backend/Properties/launchSettings.json` - Changed ports to 5062
- `/Webpage/src/contexts/AdminAuthContext.jsx` - Uses centralized API config
- `/Webpage/src/components/AdminComponents/SimpleWaitlistDashboard.jsx` - Updated API calls
- `/Webpage/src/components/AdminComponents/ContactMessagesDashboard.jsx` - Updated API calls

## How It Works:

1. **Environment Variables**: All API endpoints are now configurable via .env files
2. **Centralized Configuration**: The `apiConfig.js` file provides a single source of truth for API endpoints
3. **Automatic Authentication**: The `apiCall` function automatically adds auth headers when available
4. **Error Handling**: Centralized error handling for all API calls
5. **Fallback Values**: Default values are provided if environment variables are not set

## Testing:

To test the admin panel:
1. Ensure backend is running on port 5062
2. Navigate to `/admin` on the webpage
3. Login with: admin@invoicesystem.com / Admin123!
4. Verify all API calls work correctly

## Benefits:

- ✅ **Consistent API endpoints** across all components
- ✅ **Easy configuration** via environment variables  
- ✅ **Automatic authentication** handling
- ✅ **Centralized error handling**
- ✅ **Development vs Production** environment support
- ✅ **No more hardcoded URLs** in components
