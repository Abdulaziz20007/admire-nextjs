# JWT Token Refresh Implementation

This document describes the automatic JWT token refresh functionality implemented for the admin panel.

## Overview

The system now provides seamless token refresh functionality that automatically handles expired access tokens without requiring user intervention. When an admin performs an action and their access token has expired, the system will:

1. Detect the 401 Unauthorized response
2. Automatically attempt to refresh the access token using the refresh token
3. Retry the original request with the new access token
4. Complete the admin's intended action seamlessly

## Key Components

### 1. API Client (`src/lib/api-client.ts`)

A centralized HTTP client built on axios with automatic token refresh capabilities:

- **Request Interceptor**: Automatically adds JWT tokens to requests
- **Response Interceptor**: Handles 401 errors and triggers token refresh
- **Queue Management**: Prevents race conditions by queuing requests during refresh
- **Error Handling**: Gracefully handles refresh failures and redirects to login

#### Usage:
```typescript
import apiClient from '@/lib/api-client';

// GET request
const response = await apiClient.get('/admin/verify');

// POST request
const response = await apiClient.post('/admin/admins', adminData);

// PUT request
const response = await apiClient.put('/admin/admins/123', updateData);

// DELETE request
const response = await apiClient.delete('/admin/admins/123');
```

### 2. useApi Hook (`src/hooks/useApi.ts`)

A React hook that provides a convenient interface for making API requests with loading states:

```typescript
import { useApi } from '@/hooks/useApi';

const MyComponent = () => {
  const api = useApi({
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  });

  const handleSubmit = async () => {
    await api.post('/admin/admins', formData);
  };

  return (
    <button onClick={handleSubmit} disabled={api.loading}>
      {api.loading ? 'Saving...' : 'Save'}
    </button>
  );
};
```

### 3. Updated useAuth Hook (`src/hooks/useAuth.ts`)

The authentication hook has been updated to:

- Use the new API client for all requests
- Remove repeated authentication verification on page navigation
- Only verify authentication on initial app load
- Provide a `refreshUser` method for updating user data when needed

### 4. ProtectedRoute Component

Updated to only verify authentication on initial load, not on every page navigation within the admin panel.

## Token Refresh Flow

1. **Normal Request**: User makes an API request (POST, PUT, DELETE)
2. **Token Expired**: Server responds with 401 Unauthorized
3. **Automatic Refresh**: API client detects token error and calls `/api/admin/refresh`
4. **Queue Management**: Any concurrent requests are queued during refresh
5. **Retry Original**: Original request is retried with new access token
6. **Process Queue**: All queued requests are processed with new token
7. **Seamless Experience**: User's action completes without interruption

## Error Handling

### Successful Refresh
- New access token is stored automatically
- Original request is retried seamlessly
- User continues working without interruption

### Failed Refresh
- All tokens are cleared from storage
- User is redirected to login page
- Current path is stored for post-login redirect
- Optional session expiry message can be displayed

## Security Features

- **HTTP-only Cookies**: Refresh tokens are stored in secure HTTP-only cookies
- **Automatic Cleanup**: Tokens are cleared on authentication failure
- **Race Condition Prevention**: Request queuing prevents multiple refresh attempts
- **Secure Redirects**: Only redirects within admin area, preserves current path

## Testing

A test page is available at `/admin/test-api` that allows you to:

- Test normal API endpoints
- Simulate expired token scenarios
- Monitor the automatic refresh process
- View detailed activity logs

### Test Scenarios

1. **Normal Operation**: Make API calls with valid tokens
2. **Expired Token**: Simulate expired token and verify automatic refresh
3. **Refresh Failure**: Test behavior when refresh token is also expired
4. **Concurrent Requests**: Make multiple requests during token refresh

## Migration Guide

### For Existing Components

Replace direct fetch calls with the new API client:

```typescript
// Old approach
const response = await fetch('/api/admin/verify', {
  headers: { Authorization: `Bearer ${token}` }
});

// New approach
const response = await apiClient.get('/admin/verify');
```

### For New Components

Use the `useApi` hook for better state management:

```typescript
import { useApi } from '@/hooks/useApi';

const MyComponent = () => {
  const { data, loading, error, post } = useApi();
  
  const handleSubmit = async (formData) => {
    await post('/admin/endpoint', formData);
  };
  
  // Component renders with loading states automatically handled
};
```

## Configuration

The token refresh functionality uses existing environment variables:

- `JWT_SECRET`: Secret for signing/verifying tokens
- `JWT_ACCESS_TIME`: Access token expiration time (default: 1d)
- `JWT_REFRESH_TIME`: Refresh token expiration time (default: 7d)
- `COOKIE_TIME`: Refresh token cookie max age (default: 7 days)

## Benefits

1. **Improved UX**: No interruptions for token expiration
2. **Reduced Support**: Fewer "session expired" complaints
3. **Better Security**: Shorter access token lifetimes possible
4. **Simplified Code**: Centralized authentication handling
5. **Race Condition Safe**: Proper handling of concurrent requests
6. **Maintainable**: Clear separation of concerns

## Troubleshooting

### Common Issues

1. **Infinite Refresh Loop**: Check that refresh endpoint doesn't require access token
2. **CORS Issues**: Ensure `withCredentials: true` for refresh requests
3. **Cookie Problems**: Verify HTTP-only cookie settings in production
4. **Redirect Issues**: Check that redirect logic only applies to admin routes

### Debug Mode

Enable detailed logging by adding console.log statements in the API client's interceptors to monitor the refresh process.
